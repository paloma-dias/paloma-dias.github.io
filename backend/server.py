from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime
from models import (
    AssociadoCreate, Associado, ComercioCreate, Comercio,
    Categoria, CupomCreate, Cupom, CupomAssociado,
    LoginRequest, LoginResponse
)
from utils import (
    validar_cpf, validar_cnpj, gerar_hash_cupom,
    hash_senha, verificar_senha
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

@api_router.post("/auth/register/associado")
async def registrar_associado(data: AssociadoCreate):
    if not validar_cpf(data.cpf_associado):
        raise HTTPException(status_code=400, detail="CPF inválido")

    existe = await db.associados.find_one({"cpf_associado": data.cpf_associado})
    if existe:
        raise HTTPException(status_code=400, detail="CPF já cadastrado")

    associado_dict = data.model_dump()
    associado_dict["sen_associado"] = hash_senha(data.sen_associado)

    await db.associados.insert_one(associado_dict)

    return {"success": True, "message": "Associado cadastrado com sucesso"}

@api_router.post("/auth/register/comercio")
async def registrar_comercio(data: ComercioCreate):
    if not validar_cnpj(data.cnpj_comercio):
        raise HTTPException(status_code=400, detail="CNPJ inválido")

    existe = await db.comercios.find_one({"cnpj_comercio": data.cnpj_comercio})
    if existe:
        raise HTTPException(status_code=400, detail="CNPJ já cadastrado")

    comercio_dict = data.model_dump()
    comercio_dict["sen_comercio"] = hash_senha(data.sen_comercio)

    await db.comercios.insert_one(comercio_dict)

    return {"success": True, "message": "Comércio cadastrado com sucesso"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    if data.tipo == "associado":
        user = await db.associados.find_one({"cpf_associado": data.identificador}, {"_id": 0})
        if not user or not verificar_senha(data.senha, user["sen_associado"]):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        del user["sen_associado"]
        return LoginResponse(success=True, tipo="associado", user=user)

    elif data.tipo == "comercio":
        user = await db.comercios.find_one({"cnpj_comercio": data.identificador}, {"_id": 0})
        if not user or not verificar_senha(data.senha, user["sen_comercio"]):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        del user["sen_comercio"]
        return LoginResponse(success=True, tipo="comercio", user=user)

    raise HTTPException(status_code=400, detail="Tipo de usuário inválido")

@api_router.get("/categorias")
async def listar_categorias():
    categorias = await db.categorias.find({}, {"_id": 0}).to_list(100)
    return categorias

@api_router.post("/cupons")
async def criar_cupom(data: CupomCreate, cnpj: str):
    comercio = await db.comercios.find_one({"cnpj_comercio": cnpj}, {"_id": 0})
    if not comercio:
        raise HTTPException(status_code=404, detail="Comércio não encontrado")

    dta_inicio = datetime.strptime(data.dta_inicio_cupom, "%Y-%m-%d")
    dta_termino = datetime.strptime(data.dta_termino_cupom, "%Y-%m-%d")

    if dta_termino <= dta_inicio:
        raise HTTPException(status_code=400, detail="Data de término deve ser posterior à data de início")

    cupons_criados = []
    for _ in range(data.qtd_cupons):
        cupom = {
            "num_cupom": gerar_hash_cupom(),
            "tit_cupom": data.tit_cupom,
            "cnpj_comercio": cnpj,
            "dta_emissao_cupom": datetime.now().strftime("%Y-%m-%d"),
            "dta_inicio_cupom": data.dta_inicio_cupom,
            "dta_termino_cupom": data.dta_termino_cupom,
            "per_desc_cupom": data.per_desc_cupom
        }
        await db.cupons.insert_one(cupom)
        cupons_criados.append(cupom["num_cupom"])

    return {"success": True, "message": f"{data.qtd_cupons} cupons criados", "cupons": cupons_criados}

@api_router.get("/cupons")
async def listar_cupons_comercio(cnpj: str, filtro: str = "ativos"):
    cupons = await db.cupons.find({"cnpj_comercio": cnpj}, {"_id": 0}).to_list(1000)

    hoje = datetime.now().strftime("%Y-%m-%d")
    resultado = []

    for cupom in cupons:
        reserva = await db.cupons_associados.find_one({"num_cupom": cupom["num_cupom"]}, {"_id": 0})

        if filtro == "ativos":
            if cupom["dta_termino_cupom"] >= hoje and not reserva:
                resultado.append(cupom)
        elif filtro == "utilizados":
            if reserva and reserva.get("dta_uso_cupom_associado"):
                cupom["dta_uso"] = reserva["dta_uso_cupom_associado"]
                cupom["cpf_associado"] = reserva["cpf_associado"]
                resultado.append(cupom)
        elif filtro == "vencidos":
            if cupom["dta_termino_cupom"] < hoje and not reserva:
                resultado.append(cupom)

    resultado.sort(key=lambda x: (x["dta_inicio_cupom"], x["tit_cupom"]), reverse=True)
    return resultado

@api_router.post("/cupons/registrar-uso")
async def registrar_uso_cupom(num_cupom: str, cnpj: str):
    cupom = await db.cupons.find_one({"num_cupom": num_cupom, "cnpj_comercio": cnpj}, {"_id": 0})
    if not cupom:
        raise HTTPException(status_code=404, detail="Cupom não encontrado")

    reserva = await db.cupons_associados.find_one({"num_cupom": num_cupom}, {"_id": 0})
    if not reserva:
        raise HTTPException(status_code=400, detail="Cupom não foi reservado")

    if reserva.get("dta_uso_cupom_associado"):
        raise HTTPException(status_code=400, detail="Cupom já foi utilizado")

    await db.cupons_associados.update_one(
        {"num_cupom": num_cupom},
        {"$set": {"dta_uso_cupom_associado": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
    )

    return {"success": True, "message": "Uso do cupom registrado com sucesso"}

@api_router.get("/cupons/disponiveis")
async def listar_cupons_disponiveis(categoria: str = None):
    query = {}
    cupons = await db.cupons.find(query, {"_id": 0}).to_list(1000)

    hoje = datetime.now().strftime("%Y-%m-%d")
    resultado = []

    for cupom in cupons:
        if cupom["dta_inicio_cupom"] <= hoje <= cupom["dta_termino_cupom"]:
            reserva = await db.cupons_associados.find_one({"num_cupom": cupom["num_cupom"]}, {"_id": 0})
            if not reserva:
                comercio = await db.comercios.find_one({"cnpj_comercio": cupom["cnpj_comercio"]}, {"_id": 0})
                if comercio:
                    cupom["nom_fantasia_comercio"] = comercio["nom_fantasia_comercio"]

                    if categoria and comercio["id_categoria"] != categoria:
                        continue

                    cat = await db.categorias.find_one({"id_categoria": comercio["id_categoria"]}, {"_id": 0})
                    if cat:
                        cupom["nom_categoria"] = cat["nom_categoria"]

                    resultado.append(cupom)

    resultado.sort(key=lambda x: x["dta_inicio_cupom"], reverse=True)
    return resultado

@api_router.post("/cupons/reservar")
async def reservar_cupom(num_cupom: str, cpf: str):
    cupom = await db.cupons.find_one({"num_cupom": num_cupom}, {"_id": 0})
    if not cupom:
        raise HTTPException(status_code=404, detail="Cupom não encontrado")

    hoje = datetime.now().strftime("%Y-%m-%d")
    if not (cupom["dta_inicio_cupom"] <= hoje <= cupom["dta_termino_cupom"]):
        raise HTTPException(status_code=400, detail="Cupom fora do período de validade")

    reserva_existe = await db.cupons_associados.find_one({"num_cupom": num_cupom}, {"_id": 0})
    if reserva_existe:
        raise HTTPException(status_code=400, detail="Cupom já foi reservado")

    import uuid
    reserva = {
        "id_cupom_associado": str(uuid.uuid4()),
        "num_cupom": num_cupom,
        "cpf_associado": cpf,
        "dta_cupom_associado": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "dta_uso_cupom_associado": None
    }

    await db.cupons_associados.insert_one(reserva)

    return {"success": True, "message": "Cupom reservado com sucesso"}

@api_router.get("/cupons/reservados")
async def listar_cupons_reservados(cpf: str, filtro: str = "ativos"):
    reservas = await db.cupons_associados.find({"cpf_associado": cpf}, {"_id": 0}).to_list(1000)

    hoje = datetime.now().strftime("%Y-%m-%d")
    resultado = []

    for reserva in reservas:
        cupom = await db.cupons.find_one({"num_cupom": reserva["num_cupom"]}, {"_id": 0})
        if cupom:
            comercio = await db.comercios.find_one({"cnpj_comercio": cupom["cnpj_comercio"]}, {"_id": 0})
            if comercio:
                cupom["nom_fantasia_comercio"] = comercio["nom_fantasia_comercio"]

            cat = await db.categorias.find_one({"id_categoria": comercio["id_categoria"]}, {"_id": 0})
            if cat:
                cupom["nom_categoria"] = cat["nom_categoria"]

            reserva["cupom_info"] = cupom

            if filtro == "ativos":
                if cupom["dta_termino_cupom"] >= hoje and not reserva.get("dta_uso_cupom_associado"):
                    resultado.append(reserva)
            elif filtro == "utilizados":
                if reserva.get("dta_uso_cupom_associado"):
                    resultado.append(reserva)
            elif filtro == "vencidos":
                if cupom["dta_termino_cupom"] < hoje and not reserva.get("dta_uso_cupom_associado"):
                    resultado.append(reserva)

    resultado.sort(key=lambda x: x["cupom_info"]["dta_inicio_cupom"], reverse=True)
    return resultado

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
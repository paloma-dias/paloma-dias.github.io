import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_categorias():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]

    categorias = [
        {"id_categoria": "cat001", "nom_categoria": "Alimentação"},
        {"id_categoria": "cat002", "nom_categoria": "Vestuário"},
        {"id_categoria": "cat003", "nom_categoria": "Eletrônicos"},
        {"id_categoria": "cat004", "nom_categoria": "Saúde e Beleza"},
        {"id_categoria": "cat005", "nom_categoria": "Serviços"},
        {"id_categoria": "cat006", "nom_categoria": "Outros"}
    ]

    for cat in categorias:
        existe = await db.categorias.find_one({"id_categoria": cat["id_categoria"]})
        if not existe:
            await db.categorias.insert_one(cat)
            print(f"Categoria {cat['nom_categoria']} criada")

    client.close()
    print("Inicialização concluída")

if __name__ == "__main__":
    asyncio.run(init_categorias())

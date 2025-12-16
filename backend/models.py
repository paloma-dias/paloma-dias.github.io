from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

class AssociadoBase(BaseModel):
    cpf_associado: str
    nom_associado: str
    dtn_associado: str
    end_associado: str
    bai_associado: str
    cep_associado: str
    cid_associado: str
    uf_associado: str
    cel_associado: str
    email_associado: EmailStr

class AssociadoCreate(AssociadoBase):
    sen_associado: str

class Associado(AssociadoBase):
    pass

class ComercioBase(BaseModel):
    cnpj_comercio: str
    id_categoria: str
    raz_social_comercio: str
    nom_fantasia_comercio: str
    end_comercio: str
    bai_comercio: str
    cep_comercio: str
    cid_comercio: str
    uf_comercio: str
    con_comercio: str
    email_comercio: EmailStr

class ComercioCreate(ComercioBase):
    sen_comercio: str

class Comercio(ComercioBase):
    pass

class Categoria(BaseModel):
    id_categoria: str
    nom_categoria: str

class CupomBase(BaseModel):
    tit_cupom: str
    dta_inicio_cupom: str
    dta_termino_cupom: str
    per_desc_cupom: float

class CupomCreate(CupomBase):
    qtd_cupons: int

class Cupom(CupomBase):
    num_cupom: str
    cnpj_comercio: str
    dta_emissao_cupom: str
    nom_fantasia_comercio: Optional[str] = None
    nom_categoria: Optional[str] = None
    reservado: Optional[bool] = False

class CupomAssociado(BaseModel):
    id_cupom_associado: str
    num_cupom: str
    cpf_associado: str
    dta_cupom_associado: str
    dta_uso_cupom_associado: Optional[str] = None
    cupom_info: Optional[Cupom] = None

class LoginRequest(BaseModel):
    identificador: str
    senha: str
    tipo: str

class LoginResponse(BaseModel):
    success: bool
    tipo: str
    user: dict
    message: Optional[str] = None
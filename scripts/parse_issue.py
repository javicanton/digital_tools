#!/usr/bin/env python3
"""
Parsea el body de un issue de GitHub (template new-tool) y valida los datos.
Genera la fila CSV para tools.csv o devuelve errores.
Uso:
  python scripts/parse_issue.py --body "$(cat body.md)" [--csv tools.csv]
Salida: JSON con { "ok": true, "row": [...] } o { "ok": false, "errors": [...] }
"""

import argparse
import csv
import json
import re
import sys
from typing import Optional
from urllib.parse import urlparse

# Orden exacto de columnas del CSV (26 columnas)
COLUMNS = [
    "tool_id", "nombre", "url_oficial", "categoria_principal", "etiquetas",
    "descripcion_corta", "funcionalidades_clave", "utilidad_en_investigacion",
    "fases_investigacion", "tipos_datos", "precio_modelo", "coste_estimado",
    "requisitos_sistema", "integraciones", "importacion", "exportacion",
    "trabajo_colaborativo", "documentacion_tutoriales", "idioma_interfaz",
    "transparencia_datos", "protocolos_etica", "uso_IA", "curva_aprendizaje",
    "alternativas", "notas_limitaciones", "ultima_actualizacion_aprox",
]

# Mapeo desde el label del issue form (### Label en el body) al nombre de columna
LABEL_TO_COLUMN = {
    "Nombre de la herramienta": "nombre",
    "URL oficial": "url_oficial",
    "Categoría principal": "categoria_principal",
    "Etiquetas": "etiquetas",
    "Descripción corta": "descripcion_corta",
    "Funcionalidades clave": "funcionalidades_clave",
    "Utilidad en investigación": "utilidad_en_investigacion",
    "Fases de investigación": "fases_investigacion",
    "Tipos de datos": "tipos_datos",
    "Precio / modelo": "precio_modelo",
    "Coste estimado": "coste_estimado",
    "Requisitos de sistema": "requisitos_sistema",
    "Integraciones": "integraciones",
    "Importación (formatos)": "importacion",
    "Exportación (formatos)": "exportacion",
    "Trabajo colaborativo": "trabajo_colaborativo",
    "Documentación / tutoriales": "documentacion_tutoriales",
    "Idioma de la interfaz": "idioma_interfaz",
    "Transparencia de datos": "transparencia_datos",
    "Protocolos de ética": "protocolos_etica",
    "Uso de IA": "uso_IA",
    "Curva de aprendizaje": "curva_aprendizaje",
    "Alternativas": "alternativas",
    "Notas y limitaciones": "notas_limitaciones",
    "Última actualización (aprox.)": "ultima_actualizacion_aprox",
}

FASES_PERMITIDAS = {"diseño", "recogida", "limpieza", "análisis", "visualización", "difusión"}
TIPOS_DATOS_PERMITIDOS = {"cualitativo", "cuantitativo", "mixto"}
PRECIO_PERMITIDOS = {"gratuita", "freemium", "pago", "open source", "licencia académica"}
URL_HTTPS_REGEX = re.compile(r"^https://.+", re.IGNORECASE)


def slug(text: str) -> str:
    """Genera tool_id: minúsculas, solo [a-z0-9-]."""
    if not text or not isinstance(text, str):
        return ""
    t = text.strip().lower()
    t = re.sub(r"[^\w\s-]", "", t)
    t = re.sub(r"[-\s]+", "-", t)
    return t.strip("-") or ""


def parse_body(body: str) -> dict:
    """Extrae campos del body del issue (markdown con ### Label)."""
    data = {}
    current = None
    lines = []
    for line in (body or "").split("\n"):
        if line.startswith("### "):
            if current is not None and lines:
                raw = "\n".join(lines).strip()
                col = LABEL_TO_COLUMN.get(current)
                if col:
                    data[col] = raw
            current = line[4:].strip()
            lines = []
        elif current is not None:
            lines.append(line)
    if current is not None and lines:
        raw = "\n".join(lines).strip()
        col = LABEL_TO_COLUMN.get(current)
        if col:
            data[col] = raw
    return data


def list_to_pipe(value: str) -> str:
    """Convierte lista (comas o saltos de línea) a separada por |."""
    if not value or not value.strip():
        return ""
    parts = re.split(r"[\n,]+", value)
    return "|".join(p.strip() for p in parts if p.strip())


def normalize_fases(value: str) -> str:
    """Valida y normaliza fases_investigacion."""
    if not value or not value.strip():
        return ""
    parts = re.split(r"[\n|,]+", value.strip().lower())
    valid = []
    for p in parts:
        p = p.strip()
        if p in FASES_PERMITIDAS:
            valid.append(p)
    return "|".join(valid)


def normalize_tipos(value: str) -> str:
    """Valida tipos_datos (uno solo)."""
    if not value or not value.strip():
        return ""
    v = value.strip().lower()
    return v if v in TIPOS_DATOS_PERMITIDOS else ""


def normalize_precio(value: str) -> str:
    """Valida precio_modelo."""
    if not value or not value.strip():
        return ""
    v = value.strip().lower()
    return v if v in PRECIO_PERMITIDOS else ""


def validate(data: dict, existing_csv_path: Optional[str]) -> list[str]:
    """Valida datos y comprueba duplicados. Devuelve lista de errores (vacía si ok)."""
    errors = []

    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        errors.append("Falta 'nombre'.")
    tool_id = slug(nombre)
    if not tool_id:
        errors.append("No se pudo generar tool_id a partir del nombre.")

    url = (data.get("url_oficial") or "").strip()
    if not url:
        errors.append("Falta 'url_oficial'.")
    elif not URL_HTTPS_REGEX.match(url):
        errors.append("url_oficial debe comenzar por https://")
    else:
        try:
            parsed = urlparse(url)
            if not parsed.netloc or parsed.scheme != "https":
                errors.append("url_oficial debe ser una URL https válida.")
        except Exception:
            errors.append("url_oficial no es una URL válida.")

    desc = (data.get("descripcion_corta") or "").strip()
    if len(desc) > 280:
        errors.append("descripcion_corta tiene máximo 280 caracteres.")

    fases = normalize_fases(data.get("fases_investigacion") or "")
    if data.get("fases_investigacion") and not fases:
        errors.append(
            "fases_investigacion solo puede contener: diseño|recogida|limpieza|análisis|visualización|difusión"
        )

    tipos = normalize_tipos(data.get("tipos_datos") or "")
    if data.get("tipos_datos") and not tipos:
        errors.append("tipos_datos solo puede ser: cualitativo|cuantitativo|mixto")

    precio = normalize_precio(data.get("precio_modelo") or "")
    if data.get("precio_modelo") and not precio:
        errors.append(
            "precio_modelo solo puede ser: gratuita|freemium|pago|open source|licencia académica"
        )

    if existing_csv_path:
        try:
            with open(existing_csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if not row.get("tool_id"):
                        continue
                    if row.get("tool_id", "").strip().lower() == tool_id.lower():
                        errors.append(f"Ya existe una herramienta con tool_id '{tool_id}'.")
                        break
                    if (row.get("url_oficial") or "").strip().lower() == url.lower():
                        errors.append("Ya existe una herramienta con la misma url_oficial.")
                        break
        except FileNotFoundError:
            pass
        except Exception as e:
            errors.append(f"Error leyendo CSV existente: {e}")

    return errors


def build_row(data: dict, tool_id: str) -> list[str]:
    """Construye la fila en el orden de COLUMNS, con listas en | y NA donde corresponda."""
    def na(s: str) -> str:
        if s is None or (isinstance(s, str) and not s.strip()):
            return "NA"
        return s.strip()

    def pipe_field(key: str) -> str:
        v = data.get(key) or ""
        return list_to_pipe(v) or "NA"

    coste = (data.get("coste_estimado") or "").strip()
    if coste.lower() in ("", "na", "n/a"):
        coste = "NA"

    row = {
        "tool_id": tool_id,
        "nombre": (data.get("nombre") or "").strip() or "NA",
        "url_oficial": (data.get("url_oficial") or "").strip() or "NA",
        "categoria_principal": (data.get("categoria_principal") or "").strip() or "NA",
        "etiquetas": pipe_field("etiquetas"),
        "descripcion_corta": (data.get("descripcion_corta") or "").strip() or "NA",
        "funcionalidades_clave": pipe_field("funcionalidades_clave"),
        "utilidad_en_investigacion": (data.get("utilidad_en_investigacion") or "").strip() or "NA",
        "fases_investigacion": normalize_fases(data.get("fases_investigacion") or "") or "NA",
        "tipos_datos": normalize_tipos(data.get("tipos_datos") or "") or "NA",
        "precio_modelo": normalize_precio(data.get("precio_modelo") or "") or "NA",
        "coste_estimado": coste or "NA",
        "requisitos_sistema": list_to_pipe(data.get("requisitos_sistema") or "") or "NA",
        "integraciones": pipe_field("integraciones"),
        "importacion": pipe_field("importacion"),
        "exportacion": pipe_field("exportacion"),
        "trabajo_colaborativo": (data.get("trabajo_colaborativo") or "").strip() or "NA",
        "documentacion_tutoriales": (data.get("documentacion_tutoriales") or "").strip() or "NA",
        "idioma_interfaz": (data.get("idioma_interfaz") or "").strip() or "NA",
        "transparencia_datos": (data.get("transparencia_datos") or "").strip() or "NA",
        "protocolos_etica": (data.get("protocolos_etica") or "").strip() or "NA",
        "uso_IA": (data.get("uso_IA") or "").strip() or "NA",
        "curva_aprendizaje": (data.get("curva_aprendizaje") or "").strip() or "NA",
        "alternativas": pipe_field("alternativas"),
        "notas_limitaciones": (data.get("notas_limitaciones") or "").strip() or "NA",
        "ultima_actualizacion_aprox": (data.get("ultima_actualizacion_aprox") or "").strip() or "NA",
    }
    return [row[c] for c in COLUMNS]


def main():
    parser = argparse.ArgumentParser(description="Parse issue body and validate tool submission")
    parser.add_argument("--body", required=True, help="Body del issue (markdown)")
    parser.add_argument("--csv", default=None, help="Ruta a tools.csv para comprobar duplicados")
    parser.add_argument("--output-row", action="store_true", help="Imprimir solo la fila CSV (una línea)")
    parser.add_argument("--output-csv", default=None, help="Escribir tools.csv con la nueva fila añadida")
    args = parser.parse_args()

    data = parse_body(args.body)
    if not data.get("nombre"):
        print(json.dumps({"ok": False, "errors": ["No se encontraron datos válidos en el body del issue."]}))
        sys.exit(1)

    tool_id = slug(data.get("nombre") or "")
    errors = validate(data, args.csv)
    if errors:
        print(json.dumps({"ok": False, "errors": errors}))
        sys.exit(1)

    row = build_row(data, tool_id)
    if args.output_csv:
        if not args.csv:
            print(json.dumps({"ok": False, "errors": ["--csv es obligatorio cuando se usa --output-csv."]}))
            sys.exit(1)
        existing = args.csv
        try:
            with open(existing, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
        except FileNotFoundError:
            rows = [COLUMNS]
        rows.append(row)
        with open(args.output_csv, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
            w.writerows(rows)
        print(json.dumps({"ok": True, "tool_id": tool_id, "output": args.output_csv}))
    elif args.output_row:
        import io
        buf = io.StringIO()
        w = csv.writer(buf, quoting=csv.QUOTE_MINIMAL)
        w.writerow(COLUMNS)
        w.writerow(row)
        print(buf.getvalue().strip().split("\n")[-1])
    else:
        print(json.dumps({"ok": True, "tool_id": tool_id, "row": row, "columns": COLUMNS}))


if __name__ == "__main__":
    main()

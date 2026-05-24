import argparse


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="AmateurBaleares",
        description="Aplicación inicial de AmateurBaleares"
    )
    parser.add_argument(
        "--nombre",
        default="Mundo",
        help="Nombre para saludar"
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    print(f"Hola, {args.nombre}! Bienvenido a AmateurBaleares.")

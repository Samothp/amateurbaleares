from src.app import build_parser


def test_build_parser() -> None:
    parser = build_parser()
    args = parser.parse_args(["--nombre", "Equipo"])
    assert args.nombre == "Equipo"

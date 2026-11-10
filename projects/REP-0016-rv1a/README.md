# Simulador RV-1A

Abra app/index.html ou o atalho no mapa após publicação. HTML, CSS e JavaScript puro, sem dependências externas. Arraste a vista 3D para girar e use scroll para zoom.

Modelo destro, Z vertical, eixos locais Z/Y/Y/Z/Y/Z. Ferramenta em +Z local. Euler Rz(yaw) Ry(pitch) Rx(roll). Zero resulta em TCP (43, 0, 829) mm e orientação identidade. Geometria, offsets, eixos e modo DH padrão ficam em ROBOT_PARAMETERS no script.js. Tabela DH definitiva e calibração ainda pendentes. J3 usa referência provisória de 90° com intervalo relativo −30° a +65°.

Build: python -X utf8 scripts/build_site.py, a partir da raiz do repositório. Saída em dist/rv1a/.

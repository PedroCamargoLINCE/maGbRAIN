# Referência COSIMIR confirmada

Felipe confirmou que os ângulos e o TOOL da foto estavam aplicados.

- Juntas em graus: [10,45,70,70,15,20].
- TOOL em mm e graus: [21.21,-21.21,134.50,0,0,-45].
- Visor XYZ em mm: [497.5,159.4,373.9].
- Visor Roll/Pitch/Yaw em graus: [136.8,32.2,125.2].

## Modelo candidato

Base 300 mm conforme esboço fornecido. Braço 250 mm, deslocamento do cotovelo de magnitude 90 mm, antebraço 160 mm e punho 72 mm conforme [manual Mitsubishi BFP-A8050-K, tabela 2-1](https://www.mitsubishielectric.com/dl/fa/document/manual/robot/bfp-a8050/bfp-a8050k.pdf).

Composição local: Rz(J1), Tz(300), Ry(J2), Tz(250), Ry(J3), Tx(-90), Rz(J4), Tz(160), Ry(J5), Tz(72), Rz(J6), T(21.21,-21.21,134.5), Rz(-45). Os sinais, associação dos eixos e convenção do visor foram inferidos pela correspondência com a foto. Hipótese: mundo e base coincidem. Não foi ajustado um deslocamento arbitrário para zerar o erro.

O visor é reproduzido com R = Rz(Roll) Ry(Pitch) Rx(Yaw). O esboço mantém sua convenção XYZ anterior. O motor permanece geométrico; a tabela DH definitiva ainda depende de validação.

## Resultado reproduzível

XYZ = [497.5475661573604,159.38208945891077,373.8993861958245] mm.
Roll/Pitch/Yaw do visor = [136.78323343244494,32.150862050246126,125.23388934218097] graus.
Diferença euclidiana para os valores arredondados da foto: aproximadamente 0.051 mm. Cada uma das seis componentes coincide ao arredondar a uma casa decimal. Isso valida esta amostra, não demonstra a equivalência em todo o espaço de trabalho. Validar com outra pose, preferencialmente alterando apenas J2, antes de considerar o modelo definitivo.

## Uso

Selecionar Comparar com a foto. Home COSIMIR usa [0,0,90,0,0,0]. Zerar esboço retorna à geometria vertical original com TCP [43,0,829]. Parâmetros da tabela da interface afetam apenas o esboço; parâmetros COSIMIR ficam em ROBOT_PARAMETERS.controller.

export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
export const PORT = process.env.PORT || 4500;

export const STEAM_API_KEY =
  process.env.STEAM_API_KEY || 'B9598DCBD84F402096CB3D411AE02396';
export const BASE_IP = process.env.BASE_IP || `http://localhost`;
export const BASE_STEAM_API_URL =
  process.env.BASE_STEAM_API_URL || 'https://api.steampowered.com/';
export const BASE_RETURN_URL =
  process.env.BASE_RETURN_URL || `http://localhost:3001/profile`;
export const BASE_REALM = process.env.BASE_REALM || `http://localhost:3001/`;
export const SECRET_KEY = process.env.SECRET_KEY || 'SQGmGagfJt797J9p';

export const secureRequst = true;
export const httpOnlyRequest = true;
export const sameSiteRequest = 'lax';

export const expiresAccessToken = '7d';

export const PROJECT_KEY = 485;
export const MONEY_SECRET_KEY =
  process.env.MONEY_SECRET_KEY || 'qy6TbCQsdzPaf8DvteBFHtZZkj10zeeU';
export const RSA_PRIVATE_KEY =
  process.env.RSA_PRIVATE_KEY ||
  `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAnNs2yiGDkxyaUQ37PDZgqPiZ3jES927nd37u9ElGH8qcL7U1
2Iriqnp7qpgPK+VBiF82DqNXW5RpcxAm5UekUn2swrmMhPwgqoLlPWpSainInqKe
+86aUIpkiEEsMI/0KnHjh29o/01Z56TkBgo/M808mSeKbMxMgBvN74GnVa7WrEwx
UPfcwp47uW77HcE4jEvAYOWhZvVio2SR8xtV6mHS2E/URUbqPcYCcx1ofXTcy7wn
2bOq7WYZvzWRcHnsrvWeFVyd56/VhNbqAjNcuf+BFgxQqsaSsjiUWXutFdwXMOas
UMv6N6+Tvcd+UQd3ShuxgXurpCm/Nt8PRHmvqwIDAQABAoIBACiRccw5esQzo53P
FeluzvUkxvb2jkc8gdUgGUFJKj/SsS6NmY2V7iXVY+KtTU83DgntRhfnGxLugY9m
4AhwzQkgw+vg/XzvkKtJC20k8IfQoriUqrXJq5OlF3c+E+XDdYz8w7IlmGxfXx9Q
QEFnqQ0GyeN6nIyjEi4YAt0tFVBNbkMkZkmJ1QbX4nw4MTXZz6tnSw8OTz4F4X0x
3HZJlO1/DMQ9Wctd8JOHZxHANMI5uNFUZM21rDo7NRtul32GHtQ+AAKDw8rXV88r
UdFqJyADjCC0orKtypkFlKEGTtCNS8s6RsehoMBuX1ck6Iz7daNvIUZF7z32djJ4
WF/ok0ECgYEAynjQK+ppSoSI8zogM05cgE0/vcFpJRBOrHJWwAmHwldsPW73r05X
hAM8I+S5Z63nngTwlHaRPi2qOZ/EWE+E7H7+nUNocY69berf8CrEiASnrlYjtp8r
66wqUi6xoaJjYAjp34g17lTKpNXkqwlbPkSfdD3p7aVTjNxA7pch75sCgYEAxlMp
O9VptfdyVE50H9TI87wWVXlgDpAlvMKouVovg6OSvnkMx1gF1/bQ4DM9B3Mc1MQe
ZmDFa4MOvete7y53GEGnQRd+F2e7HfNErq08IuFYAJlp/DJSSeJ//b2EqbCbmUYp
qA3IdI0Hy4LXcSvDBO6TwmxUbilIAyhJFWgBKTECgYBr/nyqr+FxSbfyY/KA6y8T
kCCLifoXNtd/y4zR6UNsOU0Wh3W9H8A2PbN6QalSz8NW2bOovIVD8P92tOz5XZC8
xA/yud2flE8drcW8SFODaVg2+OMbqVK35aC9LQK5/++Zbaew/uolMTzVJvFM+TSd
xeR3D/8SLridzW0k1Z/YOQKBgGO0o2JFZKPrBzuDRbZLD8wZn1DReI1Zwt8nLhQh
VwnjTn8b9GSzyBxPJavRlrkMEk6VWoM124q1lM++aTfuMEmtmByNZwL1T4k7KCh5
R2ZxzABhIHt+AQjMKnSytuNoupFQSNkINOMDlAuoeA+ZZK4yE28Hb1sCvgV4V2W/
p/XBAoGAQJ6TQ20QSpdZB3k2JVqnCfVupcnGwqiwtmPxIG8M+48wV0PDt9zCn1wV
emXXfT2EDUgb+6mvjRdyZe72+Orp5uhKOchcc9hR2Yi0Z0R0WSu0qSoY02N6xLPn
DWgA/sXKt/cxvdjSwR5p5HMaLD/FNFW/Wy6zyqGwkErjE0lR19M=
-----END RSA PRIVATE KEY-----`;

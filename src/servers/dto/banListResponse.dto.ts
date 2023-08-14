import { ApiProperty } from '@nestjs/swagger';

const exampleObjet = [
  {
    steamid: '76561199115312634',
    nickname: 'DR. LIVESEY',
    reason: 'Продажа за реальные деньги',
    time: 1691990901,
    banip: 0,
  },
  {
    steamid: '76561198127572708',
    nickname: 'Boratti',
    reason: 'cheat ',
    time: 1691973094,
    banip: 0,
  },
  {
    steamid: '76561198267698766',
    nickname: 'кокочабра',
    reason: 'Отказ от проверки ',
    time: 1691972208,
    banip: 0,
  },
  {
    steamid: '76561199539870438',
    nickname: 'publisher banned',
    reason: 'cheat ',
    time: 1691963893,
    banip: 0,
  },
  {
    steamid: '76561199351242722',
    nickname: 'Bayayayo',
    reason: 'cheat ',
    time: 1691963827,
    banip: 0,
  },
  {
    steamid: '76561199045407486',
    nickname: 'UbiWan',
    reason: 'игра с читером ',
    time: 1691961843,
    banip: 0,
  },
  {
    steamid: '76561198826314847',
    nickname: 'killer6799',
    reason: 'Отказ от проверки ',
    time: 1691961798,
    banip: 0,
  },
  {
    steamid: '76561198358545075',
    nickname: 'Kasikek',
    reason: 'cheat ',
    time: 1691961323,
    banip: 0,
  },
  {
    steamid: '76561199539966809',
    nickname: 'xariz lox',
    reason: 'cheat',
    time: 1691958705,
    banip: 0,
  },
  {
    steamid: '76561199388234685',
    nickname: 'Хек',
    reason: 'Продажа за реальные деньги ',
    time: 1691954193,
    banip: 0,
  },
];

export class ResponseBanListDto {
  @ApiProperty({ example: exampleObjet })
  leaderboard: Object;
  @ApiProperty({ example: 100 })
  pages: number;
}

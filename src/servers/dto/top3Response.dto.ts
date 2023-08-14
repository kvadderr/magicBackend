import { ApiProperty } from '@nestjs/swagger';

const exampleObjet = {
  leaderboard: [
    {
      '76561198084689867': {
        stats: {
          p_score: 0,
          kp_total: 318,
          d_player: 84,
          p_lastjoin: 1691711466,
        },
        data: {
          name: 'F♥ck',
          avatar:
            'https://avatars.akamai.steamstatic.com/8a6a87ea184efdc0975e63b715e648cbea16e472_medium.jpg',
        },
        pos: 4,
      },
    },
    {
      '76561198011497741': {
        stats: {
          p_score: 0,
          kp_total: 295,
          d_player: 207,
          p_lastjoin: 1691986063,
        },
        data: {
          name: 'player',
          avatar:
            'https://avatars.steamstatic.com/689f303633aafd717f8e8695006c751515c5225c_medium.jpg',
        },
        pos: 5,
      },
    },
    {
      '76561199023094861': {
        stats: {
          p_score: 0,
          kp_total: 291,
          d_player: 129,
          p_lastjoin: 1691958466,
        },
        data: {
          name: 'Gyro Zeppeli',
          avatar:
            'https://avatars.steamstatic.com/149450ea01b70ac9b498ee46724ee8fb8398b398_medium.jpg',
        },
        pos: 6,
      },
    },
  ],
};

export class ResponseTop3Dto {
  @ApiProperty({ example: exampleObjet })
  leaderboard: Object;
}

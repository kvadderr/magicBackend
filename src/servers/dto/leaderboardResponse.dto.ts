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
    {
      '76561199018067010': {
        stats: {
          p_score: 0,
          kp_total: 284,
          d_player: 201,
          p_lastjoin: 1691976557,
        },
        data: {
          name: 'Βøśś',
          avatar:
            'https://avatars.steamstatic.com/b5dc1445e97e36e997d2a1ad90daeafc071cb04e_medium.jpg',
        },
        pos: 7,
      },
    },
    {
      '76561198369896512': {
        stats: {
          p_score: 0,
          kp_total: 276,
          d_player: 103,
          p_lastjoin: 1691980495,
        },
        data: {
          name: 'maybe you have most ego',
          avatar:
            'https://avatars.steamstatic.com/c2108b057e71c12d36efbed6e12afe01c401d5c9_medium.jpg',
        },
        pos: 8,
      },
    },
    {
      '76561199528539521': {
        stats: {
          p_score: 0,
          kp_total: 248,
          d_player: 310,
          p_lastjoin: 1691981628,
        },
        data: {
          name: 'woxtannka ♡',
          avatar:
            'https://avatars.steamstatic.com/1c077205bb676d0c2093e2f90baf930ef080b70b_medium.jpg',
        },
        pos: 9,
      },
    },
    {
      '76561198254494329': {
        stats: {
          p_score: 0,
          kp_total: 245,
          d_player: 140,
          p_lastjoin: 1691931300,
        },
        data: {
          name: 'Mr.brenn',
          avatar:
            'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
        },
        pos: 10,
      },
    },
    {
      '76561199226857616': {
        stats: {
          p_score: 0,
          kp_total: 235,
          d_player: 120,
          p_lastjoin: 1691578460,
        },
        data: {
          name: 'fanat',
          avatar: '',
        },
        pos: 11,
      },
    },
    {
      '76561199426783404': {
        stats: {
          p_score: 0,
          kp_total: 230,
          d_player: 134,
          p_lastjoin: 1691670784,
        },
        data: {
          name: 'HyperX',
          avatar: '',
        },
        pos: 12,
      },
    },
    {
      '76561199001230556': {
        stats: {
          p_score: 0,
          kp_total: 228,
          d_player: 109,
          p_lastjoin: 1691805372,
        },
        data: {
          name: 'таджик #magicrust',
          avatar:
            'https://avatars.steamstatic.com/50df801d3348ab7a9b52d1ae91010c55174aed54_medium.jpg',
        },
        pos: 13,
      },
    },
  ],
  pages: 427,
};

export class ResponseLeaderDto {
  @ApiProperty({ example: exampleObjet })
  leaderboard: Object;
  @ApiProperty({ example: 100 })
  pages: number;
}

export class ResponseUserDto {
  readonly id: number;
  readonly steamId: string;
  readonly role: string;
  readonly avatar: string;
  readonly balance: number;
  readonly name: string;

  constructor(model) {
    this.id = model.id;
    this.role = model.role;
    this.steamId = model.steamID;
    this.avatar = model.steamAvatar;
    this.balance = model.mainBalance;
    this.name = model.steamName;
  }
}

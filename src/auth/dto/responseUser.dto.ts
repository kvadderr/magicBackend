export class ResponseUserDto {
    readonly id: number
    readonly steamId: string
    readonly role: string
  
    constructor(model) {
      this.id = model.id
      this.role = model.role
      this.steamId = model.steamID
    }
  }
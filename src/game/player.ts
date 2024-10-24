export class Player {
  id: string;
  username: string;
  isReady: boolean;

  constructor(id: string, name: string) {
    this.id = id;
    this.username = name;
    this.isReady = false;
  }
}

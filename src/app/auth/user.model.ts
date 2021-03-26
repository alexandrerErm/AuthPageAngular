export class User{

  constructor(public name: string,
              public id: string,
              public token: string,
              private tokenExpirationDate: Date){

  }

  getToken(){
    if(!this.tokenExpirationDate || new Date > this.tokenExpirationDate){
      return null;
    }
    else{
      return this.token;
    }
  }
}

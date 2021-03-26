import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { UseExistingWebDriver } from 'protractor/built/driverProviders';


export interface AuthResponceData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService{

  localUser: User;
  isSignInMode = true;

  user = new BehaviorSubject<User>(null);
  signInObs = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}



  returnSignInMode(){
    return this.isSignInMode;
  }

  switchSignInToSignUp(){
    this.isSignInMode = !this.isSignInMode;
    this.signInObs.next(this.isSignInMode);
  }

  setLocalUser(){
    localStorage.setItem('userData', JSON.stringify(this.localUser));
  }

  logout(){
    this.user.next(null);
    localStorage.clear();
    this.router.navigate(['/auth']);
  }

  autoLogin(){
    const userData:{
      email: string;
      id: string;
      token: string;
      tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));
    if(!userData){
      return;
    }

    const loaderUser = new User(userData.email, userData.id, userData.token, new Date(userData.tokenExpirationDate));

    if(loaderUser.getToken()){
      this.user.next(loaderUser);
    }
  }

  signIn(email: string, password: string){
    return this.http
      .post<AuthResponceData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCZHftAuB26n4ae5GOaBpxcEPyUmh8HSf8',
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  signUp(email: string, password: string){
    return this.http
    .post<AuthResponceData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCZHftAuB26n4ae5GOaBpxcEPyUmh8HSf8',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    )
    .pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handleAuthentication(
          resData.email,
          resData.localId,
          resData.idToken,
          +resData.expiresIn
        );
      })
    );
  }


  private handleAuthentication(email: string, userId, token: string, expiresIn: number){
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    this.localUser = new User(email, userId, token, expirationDate);
    this.user.next(this.localUser);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
}

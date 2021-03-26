import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResponceData, AuthService } from './auth.service';




@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit,OnDestroy {


  subscription: Subscription;
  isSignInMode = true;
  error: string = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.authService.signInObs.subscribe((sign: boolean) => {
      this.isSignInMode = sign;
    })

  }



  switchSignInToSignUp(){
    this.authService.switchSignInToSignUp();
  }

  onPressCheckbox(){
    this.authService.setLocalUser();
  }

  onSubmit(form: NgForm){

    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<AuthResponceData>

    if(this.isSignInMode){
      authObs = this.authService.signIn(email, password);
    }else{
      authObs = this.authService.signUp(email, password);
    }

    authObs.subscribe(
      resData => {
        this.isSignInMode = false;
        this.router.navigate(['/home']);
      },
      errorRes => {
        this.error = errorRes;
        this.isSignInMode = false;
      }
    )
    form.reset();


  }

}

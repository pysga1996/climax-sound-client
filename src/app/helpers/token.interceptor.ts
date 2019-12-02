import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from '../services/auth.service';
import {UserToken} from '../models/userToken';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  currentUserToken: UserToken;
  constructor(private authService: AuthService) {
    this.authService.currentUserToken.subscribe(
      currentUser => {
        this.currentUserToken = currentUser;
      }
    );
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const requestOption: any = {};
    // add authorization header with jwt token if available
    if (this.currentUserToken) {
      requestOption.setHeaders = {
        Authorization: `Bearer ${this.currentUserToken.access_token}`
      };
    }
    request = request.clone(requestOption);
    return next.handle(request);
  }
}
import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import { tap } from 'rxjs/operators';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  subscription: Subscription = new Subscription();
  constructor(private authService: AuthService, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          if (localStorage.getItem('refreshToken')) {
            this.subscription.add(this.authService.rememberLogin().subscribe(
              userToken => {
                localStorage.setItem('userToken', JSON.stringify(userToken));
                localStorage.setItem('refreshToken', userToken.refresh_token);
                this.authService.update.emit(['login', userToken.id]);
              }, error => {
                console.log(error);
                this.authService.logout();
              }
            ));
          } else {
            this.authService.logout();
          }
          this.router.navigate(['/home']);
        } else if (err.status === 403) {
          this.router.navigate(['/home']);
        }
      }
    }));
  }
}

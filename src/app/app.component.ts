import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { RequestsService } from './services/requests.service';
import { User } from './interfaces/user';
import { DialogService } from 'ng2-bootstrap-modal';
import { RequestComponent } from './components/modals/request/request.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'platzinger'
  user: User
  requests: any[] = []
  mailsShown: any[] = []

  constructor (public router:Router,
              private authService: AuthService,
              private userService: UserService,
              private requestService: RequestsService,
              private dialogService: DialogService) {

    this.authService.getStatus().subscribe(status => {
      if (status) {
        this.userService.getUserById(status.uid).valueChanges().subscribe((data:User) => {
          this.user = data
  
          this.requestService.getRequestsForEmail(this.user.email).valueChanges().subscribe(requests => {
            this.requests = requests
            this.requests = this.requests.filter(request => {
              return request.status != 'accepted' && request.status != 'rejected'
            })
  
            this.requests.forEach(request => {
              if (this.mailsShown.indexOf(request.sender) == -1) {
                this.mailsShown.push(request.sender)
                this.dialogService.addDialog(RequestComponent,
                  {
                    scope: this,
                    currentRequest: request
                  })
              }
            })
          }, err => { this.requestService.handleError(err) })
        }, err => { this.userService.handleFatalError(err) })
      }
    }, err => { this.authService.handleFatalError(err) })
  }
}

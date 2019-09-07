import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RequestsService } from '../../services/requests.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  friends: User[]
  query: string = ''
  userUid: string
  user: User
  friendEmail: string = ''
  friendMessage: string = ''
  modalReference: NgbModalRef

  constructor(private userService: UserService,
              private authService: AuthService,
              private modalService: NgbModal,
              private requestsService: RequestsService) {

    this.authService.getStatus().subscribe(status => {
      if (status)
        this.userService.getUserById(status.uid).valueChanges().subscribe((user: User) => {
          this.user = user
          if (this.user.friends) {
            this.user.friends = Object.values(this.user.friends)
          }
        }, err => this.userService.handleFatalError(err))
    })
  }

  ngOnInit() {
  }

  open(content) {
    this.modalReference = this.modalService.open(content)
  }

  async sendRequest() {
    const request = {
      timestamp: Date.now(),
      receiver_email: this.friendEmail,
      message: this.friendMessage,
      sender: this.user.uid,
      status: 'pending'
    }

    try {
      await this.requestsService.createRequest(request)
      alert('Solicitud enviada')
    } catch (err) {
      this.requestsService.handleError(err)
    }
    this.modalReference.close()
  }
}

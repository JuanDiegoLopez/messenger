import { Component, OnInit } from '@angular/core';
import { DialogService, DialogComponent } from 'ng2-bootstrap-modal';
import { UserService } from '../../../services/user.service';
import { RequestsService } from '../../../services/requests.service';
import { User } from '../../../interfaces/user';

export interface PromptModel {
  scope: any
  currentRequest: any
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent extends DialogComponent<PromptModel, any> implements PromptModel, OnInit {
  scope: any
  currentRequest: any
  shouldAdd: string = 'yes'
  user: User

  constructor(public dialogService: DialogService,
              private userService: UserService,
              private requestService: RequestsService) {
    super(dialogService)
  }

  ngOnInit() {
    if (this.currentRequest) {
      this.userService.getUserById(this.currentRequest.sender).valueChanges().subscribe((user: User) => {
        this.user = user
      }, err => this.userService.handleFatalError(err))
    }
  }

  async accept () {
    if (this.shouldAdd == 'yes') {
      try {
        const data = await this.requestService.setRequestStatus(this.currentRequest, 'accepted')
        console.log(data)
      } catch (err) {
        this.requestService.handleError(err)
      }

      try {
        await this.userService.addFriend(this.scope.user.uid, this.currentRequest.sender)
        alert('Solicitud aceptada con exito')
      } catch (err) {
        this.userService.handleFatalError(err)
      }

    } else if (this.shouldAdd == 'no') {
      try {
        const data = await this.requestService.setRequestStatus(this.currentRequest, 'rejected')
        console.log(data)
      } catch (err) {
        this.requestService.handleError(err)
      } 
    } else if (this.shouldAdd == 'later') {
      try {
        const data = await this.requestService.setRequestStatus(this.currentRequest, 'decide_later')
        console.log(data)
      } catch (err) {
        this.requestService.handleError(err)
      }
    }
    this.close()
  }
}

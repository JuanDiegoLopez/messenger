import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  @Input() uid: string
  contact: User
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.getUserById(this.uid).valueChanges().subscribe((user: User) => {
      this.contact = user
    }, err => this.userService.handleFatalError(err))
  }
}

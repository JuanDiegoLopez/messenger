import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User
  imageChangedEvent: any = ''
  croppedImage: any = ''
  picture: any

  constructor(private userService: UserService,
              private authService: AuthService,
              private router: Router,
              private firebaseStorage: AngularFireStorage) {

    this.authService.getStatus().subscribe(
      status => {
        if (status) {
          this.userService.getUserById(status.uid).valueChanges()
          .subscribe((data: User) => {
            this.user = data
          },
          err => {
            this.userService.handleFatalError(err)
          })
        }
      },
      err => {
        this.authService.handleFatalError(err)
      }
    )
   }

  ngOnInit() {
  }
  
  async saveAvatar () {
    const currentPictureId = Date.now()
    try {
      await this.firebaseStorage.ref(`pictures/${currentPictureId}.jpg`).putString(this.croppedImage, 'data_url')
      this.picture = this.firebaseStorage.ref(`pictures/${currentPictureId}.jpg`).getDownloadURL()
    } catch (err) {
      console.log(err)
    }

    this.picture.subscribe(async url => {
      try {
        await this.userService.setAvatar(url, this.user.uid)
        alert('Avatar subido correctamente')
      } catch (err) {
        this.userService.handleFatalError(err)
      }
    })
  }

  async saveSettings () {
      try {
        await this.userService.createOrUpdateUser(this.user)
        alert('Cambios guardados con éxito!')
        this.router.navigate(['home'])
      } catch (err) {
        this.userService.handleFatalError(err)
      }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event
  }
  imageCropped(image: string) {
    this.croppedImage = image
  }
}

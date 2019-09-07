import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { User } from '../../interfaces/user'
import { UserService } from '../../services/user.service'
import { ConversationService } from '../../services/conversation.service'
import { AuthService } from '../../services/auth.service';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {
  friendId: any
  friend: User
  user: User
  conversationId: string
  textMessage: string
  conversation: any[]
  shake: boolean = false
  imageChangedEvent: any = ''
  croppedImage: any = ''
  pictureMessage: any
  showModal: boolean = false
  @ViewChild('scrollBox') element: ElementRef
  @ViewChild('inputImage') inputImage: ElementRef

  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private userService: UserService,
              private conversationService: ConversationService,
              private angularFireStorage: AngularFireStorage) { 
  
    this.friendId = this.activatedRoute.snapshot.params['uid']
    
    this.userService.getUserById(this.friendId).valueChanges()
    .subscribe((data: User) => {
      this.friend = data
    }, err => {
      this.userService.handleFatalError(err)
    })

    this.authService.getStatus().subscribe(status => {
      if (status) {
        this.userService.getUserById(status.uid)
        .valueChanges().subscribe((user: User) => {
          this.user = user
          const ids = [this.user.uid, this.friendId].sort()
          this.conversationId = ids.join('|')
          this.getConversations()
        }, err => {
          this.userService.handleFatalError(err)
        })
      }
    })
  }

  ngOnInit() {
  }

  async sendMessage () {
    const message = {
      uid: this.conversationId,
      timestamp: Date.now(),
      text: this.textMessage,
      sender: this.user.uid,
      receiver: this.friendId,
      type: 'text'
    }
    try {
      await this.conversationService.createConversation(message)
      this.textMessage = ''
    } catch (err) {
      this.conversationService.handleError(err)
    }
  }

  async sendZumbido () {
    const message = {
      uid: this.conversationId,
      timestamp: Date.now(),
      text: null,
      sender: this.user.uid,
      receiver: this.friendId,
      type: 'zumbido'
    }
    try {
      await this.conversationService.createConversation(message)
    } catch (err) {
      this.conversationService.handleError(err)
    }
  }

  doZumbido () {
    const audio = new Audio('assets/sound/zumbido.m4a')
    audio.play()
    this.shake = true
    window.setTimeout( () => this.shake = false , 1000)
  }

  getConversations () {
    this.conversationService.getConversation(this.conversationId).valueChanges()
    .subscribe(data => {
      this.conversation = data
      this.conversation.forEach(message => {
        if (!message.seen) {
          message.seen = true
          this.conversationService.editConversation(message)
          if (message.type == 'text' && message.sender != this.user.uid) {
            const audio = new Audio('assets/sound/new_message.m4a')
            audio.play()
          } else if (message.type == 'zumbido') {
            this.doZumbido()
          }
        }
      })
      },
      err => {
        this.conversationService.handleError(err)
      })
  }

  zumbidoText (message) {
    if (message.sender == this.user.uid) return 'Has enviado un Zumbido!'
    else return 'Te han enviado un Zumbido!'
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event
    this.showModal = true
  }

  imageCropped(image: string) {
    this.croppedImage = image
  }

  closeModal () {
    this.showModal = false
    this.croppedImage = ''
    this.inputImage.nativeElement.value = ''
  }

  async sendImage () {
    const currentImageId = Date.now()
    try {
      await this.angularFireStorage.ref(`messagesPictures/${currentImageId}|${this.conversationId}.jpg`).putString(this.croppedImage, 'data_url')
      this.pictureMessage = this.angularFireStorage.ref(`messagesPictures/${currentImageId}|${this.conversationId}.jpg`).getDownloadURL()
    } catch (err) {
      console.log(err)
    }   
    this.pictureMessage.subscribe(async url => {
      const message = {
        uid: this.conversationId,
        timestamp: Date.now(),
        text: url,
        sender: this.user.uid,
        receiver: this.friendId,
        type: 'image'
      }
      try{
        await this.conversationService.createConversation(message)
        this.showModal = false
        this.croppedImage = ''
        this.inputImage.nativeElement.value = ''
      } catch (err) {
        this.conversationService.handleError(err)
      } 
    }, err => console.log(err))

  }
}

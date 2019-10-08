import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {PlaylistService} from '../../service/playlist.service';
import {SongService} from '../../service/song.service';

@Component({
  selector: 'app-delete-playlist-song',
  templateUrl: './delete-playlist-song.component.html',
  styleUrls: ['./delete-playlist-song.component.scss']
})
export class DeletePlaylistSongComponent implements OnInit {
  @Input() id: number;
  @Input() name: string;
  deleted: boolean;
  loading = false;
  error = '';
  message: string;
  @Output() deleteSongPlaylist = new EventEmitter();
  constructor(private modalService: NgbModal,  private fb: FormBuilder,
              private route: ActivatedRoute, private router: Router, private authService: AuthService,
              private songService: SongService) { }

  ngOnInit(): void {
    this.deleted = false;
  }
  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.deleteSongPlaylist.emit();
      this.message = '';
    }, (reason) => {
      console.log(this.getDismissReason(reason));
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  onSubmit() {
    this.songService.deleteSongPlaylist(this.id).subscribe(
      result => {
        this.deleted = true;
        console.log(this.deleted);
        this.message = 'Song Playlist deleted successfully!';
      },
      error => {
        this.message = 'Failed to delete song playlist. Cause: ' + error.message;
        console.log(error);
      }
    );
  }
}
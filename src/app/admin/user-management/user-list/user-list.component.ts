import {Component, OnInit} from '@angular/core';
import {User} from '../../../model/user';
import {AdminService} from '../../../service/admin.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  pageNumber: number;
  pageSize: number;
  message: string;
  userList: User[];
  subscription: Subscription = new Subscription();

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {

    this.subscription = this.adminService.getUserList().subscribe(
      result => {
        if (result != null) {
          this.userList = result.content;
          this.userList.forEach((value, index) => {
            this.userList[index].enabled = false;
          });
          this.pageNumber = result.pageable.pageNumber;
          this.pageSize = result.pageable.pageSize;
        }
      }, error => {
        console.log(error.message);
      }
    );
  }
  deleteUser() {
    // this.subscription.unsubscribe();
    this.subscription = this.adminService.getUserList().subscribe(
      result => {
        if (result != null) {
          this.userList = result.content;

        } else {
          this.userList = null;
        }
      }, error => {
        this.message = 'Cannot retrieve artist list. Cause: ' + error.message;
      }
    );
  }
}

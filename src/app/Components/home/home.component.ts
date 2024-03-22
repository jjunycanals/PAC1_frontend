import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { FormatDatePipe } from 'src/app/Pipes/format-date.pipe';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  posts!: PostDTO[];
  showButtons: boolean;
  public searchResults$!: Observable<PostDTO[]>;
  searchResults: PostDTO[]= [];

  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
    private router: Router,
    private headerMenusService: HeaderMenusService
  ) {
    this.showButtons = false;
    this.loadPosts();
  }

  ngOnInit(): void {
    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showButtons = headerInfo.showAuthSection;
        }
      }
    );
  }
  private async loadPosts(): Promise<void> {
    // TODO 2
    let errorResponse: any;
    try {
      this.posts = await this.postService.getPosts();
      // console.log(this.posts);     
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  async like(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.likePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  async dislike(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.dislikePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }


  // Ex 10
  search(event: any) {
    console.log(event.value);
    if (event.value !== '') { 
      this.loadPosts().then(() => {
        // Reiniciem cada cop searchResults per fer nova busqueda des de 0.
        this.searchResults = [];
        this.posts.forEach((element: PostDTO) => {
          // console.log("busco: "+element.title+ " per trobar "+event.value+"");
          
          if (element.title === event.value) {
            this.searchResults.push(element);
          }
        });
        this.searchResults$ = of(this.searchResults); // Convertim l'array en observable    

      }).catch(error => {
        console.error('Error loading posts:', error);
      });
    } else {
      location.reload();
    }
    

  }

}

import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl,UntypedFormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { PostDTO } from '../../../Models/post.dto';
import { formatDate } from '../../../../../node_modules/@angular/common';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {
  post: PostDTO;
  title: UntypedFormControl;
  description: UntypedFormControl;
  publication_date: UntypedFormControl;
  categories: UntypedFormControl;
  

  postsForm: UntypedFormGroup;
  isValidForm: boolean | null;

  private isUpdateMode: boolean;
  private validRequest: boolean;
  private postId: string | null;
    
  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService
  ) {
    this.isValidForm = null;
    this.postId = this.activatedRoute.snapshot.paramMap.get('id');
    this.post = new PostDTO('','',0,0, new Date());
    this.isUpdateMode = false;
    this.validRequest = false;

    this.title = new UntypedFormControl(this.post.title, [
      Validators.required,
      Validators.maxLength(55),
    ]);

    this.description = new UntypedFormControl(this.post.description, [
      Validators.required,
      Validators.maxLength(255),
    ]);

    this.publication_date = new UntypedFormControl(this.post.publication_date, [
      Validators.required,
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/), // Format 'yyyy-mm-dd'
    ]);

    // Aqui crido arrayCategories que crida loadingCategories i agafem les seleccionades en cas de update
    this.categories = new UntypedFormControl(this.arrayCategories(), []);
    
    // parametres anteriors aplicats  postsForm
    this.postsForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      publication_date: this.publication_date,
      categories: this.categories,
    });

  }
  // TODO 13
  async ngOnInit(): Promise<void> {
    let errorResponse: any;

    if (this.postId) {
      this.isUpdateMode = true;
      try {
        this.post = await this.postService.getPostById(this.postId);

        this.title.setValue(this.post.title);
        this.description.setValue(this.post.description);
        this.publication_date.setValue(
          formatDate(this.post.publication_date, 'yyyy-MM-dd', 'en'));
        this.categories.setValue(this.post.categories);
          
        this.postsForm = this.formBuilder.group({
          title: this.title,
          description: this.description,
          publication_date: this.publication_date,
          categories: this.categories,
        });
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  // Primer loadCategories() crida les categories que hi hagi a Categories, 
  // per tenir sempre la llista actualizada de les categories que existeixen 
  // en aquest moment (ja que es poden eliminar)

  // a categoryList guardarem les categories que existeixen
  categoryList: any[]=[];
  async loadCategories() {
    // Recuperem userID
    var userId = this.localStorageService.get('user_id');
    if (userId) {
      try {
        // cridem el servei que retorna les categories
        this.categoryList = await this.categoryService.getCategoriesByUserId(userId);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }
    return this.categoryList;
  }
  // selected guardarem les categories a mostrar seleccionades
  selected: any[]=[];
  async arrayCategories(){
    try {
      // Cridem a loadCategories() perquè en doni el llistat actualitzat de Categories que existeixen
      const categorias = await this.loadCategories();
      
      var obj = await this.arrayCatPost(this.postId);
      this.selected = obj['categories'];

    } catch (error) {
      console.error('Error in arrayCategories function:', error);
    }
  }
  isSelected(category: any): boolean {
    let sel = false;
    // console.log(this.selected);
    // Iterem els element seleccionats previs per l'usuari per aquell post
    this.selected.forEach(element => {

      // Els comparem amb el category que estem iteran en l'arxiu html
      // D'aquesta manera revisem tots els CategoryLists vs els seleccionats
      if (element.categoryId === category.categoryId) {
        sel = true;
      }
    });
    return sel;
  }
  
  async arrayCatPost(postId: any): Promise<any> {
    try {
      const catpost = await this.postService.getPostById(postId);
      // console.log(catpost);
      return catpost;
    } catch (error) {
      console.error('Error in arrayCatPost function:', error);
    }
    
  }


  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.post.userId = userId;
        try {
          console.log(this.post);
          await this.postService.updatePost(this.postId, this.post);
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast(
          'postFeedback',
          responseOK,
          errorResponse
        );

        if (responseOK) {
          this.router.navigateByUrl('posts');
        }
      }
    }
    return responseOK;
  }

  private async createPost(): Promise<boolean>{
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get('user_id');

    if (userId) {
      this.post.userId = userId;

      try {
        await this.postService.createPost(this.post);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast(
        'postFeedback',
        responseOK,
        errorResponse
      );

      if (responseOK) {
        this.router.navigateByUrl('posts');
      }
    }

    return responseOK;
  }

  async savePost() {
    this.isValidForm = false;
    if (this.postsForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.post = this.postsForm.value;
    console.log(this.isUpdateMode);
    if (this.isUpdateMode == true) {
      this.validRequest = await this.editPost();
    } else {
      this.validRequest = await this.createPost();
    }
  }
}
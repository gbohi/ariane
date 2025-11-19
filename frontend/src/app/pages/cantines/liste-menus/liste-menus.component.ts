import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-liste-menus',
  templateUrl: './liste-menus.component.html',
  styleUrl: './liste-menus.component.scss',
  providers: [DecimalPipe]
})
export class ListeMenusComponent {

}

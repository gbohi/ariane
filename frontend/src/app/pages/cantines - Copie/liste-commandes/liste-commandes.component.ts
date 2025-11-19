import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-liste-commandes',
  templateUrl: './liste-commandes.component.html',
  styleUrl: './liste-commandes.component.scss',
  providers: [DecimalPipe]
})
export class ListeCommandesComponent {

}

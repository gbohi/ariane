import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
// Component
import { ListePlatsComponent } from './liste-plats/liste-plats.component';
import { ListeMenusComponent } from './liste-menus/liste-menus.component';
import { ListeCommandesComponent } from './liste-commandes/liste-commandes.component';


const routes: Routes = [
  {
    path: 'liste-plats',
    component: ListePlatsComponent
  },
  {
    path: 'liste-menus',
    component: ListeMenusComponent
  },
  {
    path: 'liste-commandes',
    component: ListeCommandesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CantinesRoutingModule { }
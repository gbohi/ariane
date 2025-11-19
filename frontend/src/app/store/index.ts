import { ActionReducerMap } from "@ngrx/store";
import { AnalyticsReducer, AnalyticsState } from "./Analytics/analytics.reducer";
import { CRMReducer, CRMState } from "./CRM/crm.reducer";
import { ECoReducer, ECoState } from "./Ecommerce/ecommerce.reducer";
import { LearningReducer, LearningState } from "./Learning/learning.reducer";
import { RealReducer, RealState } from "./RealEstate/realEstate.reducer";
import { AppRealestateReducer, AppRealestateState } from "./App-realestate/apprealestate.reducer";
import { AgentReducer, AgentState } from "./Agent/agent.reducer";
import { AgenciesReducer, AgenciesState } from "./Agency/agency.reducer";
import { TicketReducer, TicketState } from "./Tickets/ticket.reducer";
import { ChatReducer, ChatState } from "./chat/chat.reducer";
import { ProductReducer, ProductState } from "./Product/product.reducer";
import { InvoiceReducer, InvoiceState } from "./Invoices/invoices.reducer";
import { AuthenticationState, authenticationReducer } from "./Authentication/authentication.reducer";
import { LayoutState, layoutReducer } from "./layouts/layout-reducers";
import { SelleReducer, SellerState } from "./Seller/seller.reducer";
import { OrderReducer, OrderState } from "./Orders/order.reducer";
import { InstructorReducer, InstructorState } from "./Learning-instructor/instructor.reducer";
import { CustomerReducer, CustomerState } from "./Customer/customer.reducer";
import { StudentsReducer, studentState } from "./students/student.reducer";
import { CourcesReducer, CourcesState } from "./Learning-cources/cources.reducer";

//UBI
import { PrioriteReducer, PrioriteState } from "./Priorite/priorite.reducer";
import { EtatReducer, EtatState } from "./Etat/etat.reducer";
import { StatutReducer, StatutState } from "./Statut/statut.reducer";
import { AgenceReducer, AgenceState } from "./Agence/agence.reducer";
import { DepartementReducer, DepartementState } from "./Departement/departement.reducer";
import { TypebesoinReducer, TypebesoinState } from "./Typebesoin/typebesoin.reducer";
import { RoleReducer, RoleState } from "./Role/role.reducer";
import { UserReducer, UserState } from "./User/user.reducer";
import { BesoinReducer, BesoinState } from "./Besoin/besoin.reducer";
import { TypeplatReducer, TypeplatState } from "./Typeplat/typeplat.reducer";
import { PlatReducer, PlatState } from "./Plat/plat.reducer";
import { TypevehiculeReducer, TypevehiculeState } from "./Typevehicule/typevehicule.reducer";
import { VehiculeReducer, VehiculeState } from "./Vehicule/vehicule.reducer";
import { EntretienvehiculeReducer, EntretienvehiculeState } from "./Entretienvehicule/entretienvehicule.reducer";
import { dashboardentretienvehiculeReducer, DashboardEntretienVehiculeState } from "./Dashboardentretienvehicule/dashboardentretienvehicule.reducer";
import { DashboardSimulationReducer, DashboardSimulationState } from "./Dashboardsimulation/dashboardsimulation.reducer";


export interface RootReducerState {
    layout: LayoutState,
    auth: AuthenticationState;
    statlist: AnalyticsState;
    CRMlist: CRMState;
    Ecommercelist: ECoState;
    Learninglist: LearningState;
    Realist: RealState;
    Apprealestate: AppRealestateState;
    Agentlist: AgentState;
    Agenciesdata: AgenciesState;
    ticketlist: TicketState;
    Chatmessage: ChatState;
    product: ProductState;
    Invoice: InvoiceState;
    Sellerlist: SellerState;
    Orderlist: OrderState;
    LearningList: InstructorState;
    CustomerList: CustomerState;
    SubscriptionList: studentState;
    CourcesList: CourcesState;
    Instructorlist: InstructorState;
    priorite: PrioriteState;  // Ajout de Priorite
    etat: EtatState;
    statut: StatutState;
    agence: AgenceState;
    departement: DepartementState;
    typebesoin: TypebesoinState;
    role: RoleState;
    user: UserState;
    besoin: BesoinState;
    typeplat: TypeplatState;
    plat: PlatState;
    typevehicule: TypevehiculeState;
    vehicule: VehiculeState;
    entretienvehicule: EntretienvehiculeState;
    dashboardentretienvehicule: DashboardEntretienVehiculeState;
    dashboardsimulation: DashboardSimulationState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
    layout: layoutReducer,
    statlist: AnalyticsReducer,
    CRMlist: CRMReducer,
    auth: authenticationReducer,
    Ecommercelist: ECoReducer,
    Learninglist: LearningReducer,
    Realist: RealReducer,
    Apprealestate: AppRealestateReducer,
    Agentlist: AgentReducer,
    Agenciesdata: AgenciesReducer,
    ticketlist: TicketReducer,
    Chatmessage: ChatReducer,
    product: ProductReducer,
    Invoice: InvoiceReducer,
    Sellerlist: SelleReducer,
    Orderlist: OrderReducer,
    LearningList: InstructorReducer,
    CustomerList: CustomerReducer,
    SubscriptionList: StudentsReducer,
    CourcesList: CourcesReducer,
    Instructorlist: InstructorReducer,
    priorite: PrioriteReducer,
    etat: EtatReducer,
    statut: StatutReducer,
    agence: AgenceReducer,
    departement: DepartementReducer,
    typebesoin: TypebesoinReducer,
    role: RoleReducer,
    user: UserReducer,
    besoin: BesoinReducer,
    typeplat: TypeplatReducer,
    plat: PlatReducer,
    typevehicule: TypevehiculeReducer,
    vehicule: VehiculeReducer,
    entretienvehicule: EntretienvehiculeReducer,
    dashboardentretienvehicule: dashboardentretienvehiculeReducer,
    dashboardsimulation: DashboardSimulationReducer
}
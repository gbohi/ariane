from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_created = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_created'
    )
    user_updated = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_updated'
    )

    class Meta:
        abstract = True

class User(AbstractUser):
    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)
    contact = models.CharField(max_length=255)
    poste_telephone = models.CharField(max_length=255)
    statut = models.ForeignKey('Statut', on_delete=models.CASCADE)
    last_logout = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_created = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        related_name='utilisateurs_crees'
    )
    user_updated = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        related_name='utilisateurs_modifies'
    )

    class Meta:
        db_table = 'users'

class Agence(BaseModel):
    nom_agence = models.CharField(max_length=255)

class Etat(BaseModel):
    libelle_etat = models.CharField(max_length=255)

class Statut(BaseModel):
    libelle_statut = models.CharField(max_length=255)

class Service(BaseModel):
    libelle_service = models.CharField(max_length=255)

class TypeBesoin(BaseModel):
    libelle = models.CharField(max_length=255)

class Priorite(BaseModel):
    libelle = models.CharField(max_length=255)

class UserService(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField(null=True, blank=True)
    statut = models.ForeignKey(Statut, on_delete=models.CASCADE)

class UserAgence(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    agence = models.ForeignKey(Agence, on_delete=models.CASCADE)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField(null=True, blank=True)
    statut = models.ForeignKey(Statut, on_delete=models.CASCADE)

class Besoin(BaseModel):
    reference = models.CharField(max_length=255, unique=True)
    titre = models.CharField(max_length=255)
    description = models.TextField()
    commentaire = models.TextField(null=True, blank=True)
    typebesoin = models.ForeignKey(TypeBesoin, on_delete=models.CASCADE)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    etat = models.ForeignKey(Etat, on_delete=models.CASCADE)
    priorite = models.ForeignKey(Priorite, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class BesoinService(BaseModel):
    besoin = models.ForeignKey(Besoin, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    date_creation = models.DateTimeField()

#class BesoinDocument(BaseModel):
#    besoin = models.ForeignKey(Besoin, on_delete=models.CASCADE)
#    lien_document = models.URLField()
#    date_creation = models.DateTimeField()

class BesoinDocument(BaseModel):
    besoin = models.ForeignKey(Besoin, on_delete=models.CASCADE, related_name="documents")
    document = models.FileField(upload_to='documents_besoins/', validators=[FileExtensionValidator(['pdf', 'docx', 'jpg', 'png','jpeg'])])
    date_creation = models.DateTimeField(auto_now_add=True)

class TypePlat(BaseModel):
    libelle = models.CharField(max_length=100)

class Plat(BaseModel):
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type_plat = models.ForeignKey(TypePlat, on_delete=models.CASCADE)
    agence = models.ForeignKey(Agence, on_delete=models.CASCADE)

class PlatImage(BaseModel):
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE, related_name="images")
    image = models.FileField(upload_to='images_plats/', validators=[FileExtensionValidator(['jpg', 'jpeg', 'png','pdf'])])
    is_principale = models.BooleanField(default=False)

class Menu(BaseModel):
    date_menu = models.DateField(unique=True)
    agence = models.ForeignKey(Agence, on_delete=models.CASCADE)

class MenuPlat(BaseModel):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name="menu_plats")
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE)

class Commande(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE)
    date_commande = models.DateTimeField(default=timezone.now)
    est_annule = models.BooleanField(default=False)
    date_annulation = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'menu')

class Retrait(BaseModel):
    commande = models.OneToOneField(Commande, on_delete=models.CASCADE)
    date_retrait = models.DateTimeField(default=timezone.now)
    badge_matricule = models.CharField(max_length=100)

#Gestion Cantine


#Debut Gestion entretien vehicule
class TypeVehicule(BaseModel):
    libelle = models.CharField(max_length=100)

class Vehicule(BaseModel):
    immatriculation = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type_vehicule = models.ForeignKey(TypeVehicule, on_delete=models.CASCADE)
    statut = models.ForeignKey(Statut, on_delete=models.CASCADE)
    agence = models.ForeignKey(Agence, on_delete=models.CASCADE)
    date_circulation = models.DateTimeField()

class EntretienVehicule(BaseModel):
    description = models.TextField(blank=True)
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
    date_entretien_vehicule = models.DateTimeField()
    periode = models.CharField(max_length=10)
    debit = models.DecimalField(max_digits=10, decimal_places=2)
    credit = models.DecimalField(max_digits=10, decimal_places=2)
    solde = models.DecimalField(max_digits=10, decimal_places=2)
#Fin Gestion entretien vehicule

# Ressource Humaines

class SimulationSalaire(models.Model):
    matricule = models.CharField(max_length=20)
    categorie = models.CharField(max_length=10)
    date_naissance = models.DateField()
    salaire_base = models.DecimalField(max_digits=10, decimal_places=2)
    sursalaire = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    salaire_brut_2025 = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

class SimulationHistorique(models.Model):
    simulation = models.ForeignKey(SimulationSalaire, on_delete=models.CASCADE, related_name='historique')
    annee = models.IntegerField()
    age = models.IntegerField()
    salaire = models.DecimalField(max_digits=12, decimal_places=2)
    taux_augmentation = models.DecimalField(max_digits=5, decimal_places=2)
    augmentation = models.DecimalField(max_digits=12, decimal_places=2)
    cotisation = models.DecimalField(max_digits=12, decimal_places=2)

class SimulationHistorique2(models.Model):
    simulation = models.ForeignKey(SimulationSalaire, on_delete=models.CASCADE, related_name='historique2')
    annee = models.IntegerField()
    age = models.IntegerField()
    salaire = models.DecimalField(max_digits=12, decimal_places=2)
    taux_augmentation = models.DecimalField(max_digits=5, decimal_places=2)
    augmentation = models.DecimalField(max_digits=12, decimal_places=2)
    cotisation = models.DecimalField(max_digits=12, decimal_places=2)
#Fin Ressources Humaines

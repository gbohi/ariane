from collections import defaultdict
from rest_framework import serializers
from datetime import datetime
from django.db.models import Max
from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from django.db import IntegrityError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import Group
from .models import *
from django.db.models import Q

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'password2', 'email', 
            'nom', 'prenom', 'contact', 'poste_telephone', 
            'first_name','last_name',
            'statut', 'last_login', 'last_logout', 'is_active'
        ]
        read_only_fields = ['last_login', 'last_logout']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class AgenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agence
        fields = '__all__'

class EtatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etat
        fields = '__all__'

class StatutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statut
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class TypeBesoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeBesoin
        fields = '__all__'

class PrioriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Priorite
        fields = '__all__'

class UserServiceSerializer(serializers.ModelSerializer):
    # Ajout des champs imbriqués
    service_detail = serializers.SerializerMethodField()
    statut_detail = serializers.SerializerMethodField()
    user_detail = serializers.SerializerMethodField()

    class Meta:
        model = UserService
        fields = '__all__'

    def get_service_detail(self, obj):
        return {
            'id': obj.service.id,
            'libelle_service': obj.service.libelle_service
        }

    def get_statut_detail(self, obj):
        return {
            'id': obj.statut.id,
            'libelle_statut': obj.statut.libelle_statut
        }

    def get_user_detail(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'nom': obj.user.nom,
            'prenom': obj.user.prenom,
            'email': obj.user.email
        }

class UserAgenceSerializer(serializers.ModelSerializer):
    agence_detail = serializers.SerializerMethodField()
    statut_detail = serializers.SerializerMethodField()
    user_detail = serializers.SerializerMethodField()

    class Meta:
        model = UserAgence
        fields = '__all__'

    def get_agence_detail(self, obj):
        return {
            'id': obj.agence.id,
            'nom_agence': obj.agence.nom_agence
        }

    def get_statut_detail(self, obj):
        return {
            'id': obj.statut.id,
            'libelle_statut': obj.statut.libelle_statut
        }

    def get_user_detail(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'nom': obj.user.nom,
            'prenom': obj.user.prenom,
            'email': obj.user.email
        }

class BesoinServiceSerializer(serializers.ModelSerializer):
    service_detail = serializers.SerializerMethodField()
    besoin_detail = serializers.SerializerMethodField()

    class Meta:
        model = BesoinService
        fields = '__all__'

    def get_service_detail(self, obj):
        return {
            'id': obj.service.id,
            'libelle_service': obj.service.libelle_service
        }

    def get_besoin_detail(self, obj):
        return {
            'id': obj.besoin.id,
            'reference': obj.besoin.reference,
            'titre': obj.besoin.titre,
            'description': obj.besoin.description,
            'typebesoin': {
                'id': obj.besoin.typebesoin.id,
                'libelle': obj.besoin.typebesoin.libelle
            },
            'etat': {
                'id': obj.besoin.etat.id,
                'libelle_etat': obj.besoin.etat.libelle_etat
            },
            'priorite': {
                'id': obj.besoin.priorite.id,
                'libelle': obj.besoin.priorite.libelle
            }
        }

class BesoinDocumentSerializer(serializers.ModelSerializer):
    besoin_detail = serializers.SerializerMethodField()

    class Meta:
        model = BesoinDocument
        fields = '__all__'

    def get_besoin_detail(self, obj):
        return {
            'id': obj.besoin.id,
            'reference': obj.besoin.reference,
            'titre': obj.besoin.titre,
            'description': obj.besoin.description,
            'typebesoin': {
                'id': obj.besoin.typebesoin.id,
                'libelle': obj.besoin.typebesoin.libelle
            },
            'etat': {
                'id': obj.besoin.etat.id,
                'libelle_etat': obj.besoin.etat.libelle_etat
            },
            'priorite': {
                'id': obj.besoin.priorite.id,
                'libelle': obj.besoin.priorite.libelle
            }
        }

class BesoinSerializer(serializers.ModelSerializer):
    typebesoin_detail = serializers.SerializerMethodField()
    etat_detail = serializers.SerializerMethodField()
    priorite_detail = serializers.SerializerMethodField()
    user_detail = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()

    class Meta:
        model = Besoin
        fields = '__all__'

    def get_typebesoin_detail(self, obj):
        return {
            'id': obj.typebesoin.id,
            'libelle': obj.typebesoin.libelle
        }

    def get_etat_detail(self, obj):
        return {
            'id': obj.etat.id,
            'libelle_etat': obj.etat.libelle_etat
        }

    def get_priorite_detail(self, obj):
        return {
            'id': obj.priorite.id,
            'libelle': obj.priorite.libelle
        }

    def get_user_detail(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'nom': obj.user.nom,
            'prenom': obj.user.prenom,
            'email': obj.user.email
        }

    def get_services(self, obj):
        besoin_services = BesoinService.objects.filter(besoin=obj)
        return BesoinServiceSerializer(besoin_services, many=True).data

    def get_documents(self, obj):
        besoin_documents = BesoinDocument.objects.filter(besoin=obj)
        return BesoinDocumentSerializer(besoin_documents, many=True).data
    

class BesoinDocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BesoinDocument
        fields = ['document']

class BesoinWithDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Besoin
        fields = [
            'titre', 'description', 'commentaire',
            'typebesoin', 'date_debut', 'date_fin',
            'etat', 'priorite', 'user'
        ]

    def create(self, validated_data):
        now = datetime.now()
        year = now.strftime('%Y')   # ex: '2025'
        month = now.strftime('%m')  # ex: '04'
        prefix = f"BES-{year}{month}"

        # Étape 1 : calcul du compteur de départ
        last_ref = Besoin.objects.filter(reference__startswith=prefix).aggregate(
            Max('reference')
        )['reference__max']

        if last_ref:
            try:
                last_number = int(last_ref[-4:])
            except ValueError:
                last_number = 0
        else:
            last_number = 0

        # Étape 2 : tentative sécurisée pour créer un besoin avec une référence unique
        for attempt in range(10):  # max 10 essais
            next_number = last_number + 1
            new_reference = f"{prefix}{next_number:04d}"
            validated_data['reference'] = new_reference

            try:
                besoin = Besoin.objects.create(**validated_data)
                break  # ✅ succès
            except IntegrityError:
                last_number += 1  # 🔁 essayer une nouvelle référence
        else:
            raise serializers.ValidationError("Impossible de générer une référence unique après plusieurs tentatives.")

        # Étape 3 : ajouter les documents
        files = self.context['request'].FILES.getlist('documents[]')
        for file in files:
            BesoinDocument.objects.create(besoin=besoin, document=file)

        return besoin


# Cantine

class TypePlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypePlat
        fields = '__all__'

class PlatImageSerializer(serializers.ModelSerializer):
    plat_nom = serializers.ReadOnlyField(source='plat.nom')

    class Meta:
        model = PlatImage
        fields = ['id', 'plat', 'plat_nom', 'image', 'is_principale']


class PlatSerializer(serializers.ModelSerializer):
    type_plat_detail = serializers.SerializerMethodField()
    agence_detail = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Plat
        fields = '__all__'

    def get_type_plat_detail(self, obj):
        return {
            'id': obj.type_plat.id,
            'libelle': obj.type_plat.libelle
        }

    def get_agence_detail(self, obj):
        return {
            'id': obj.agence.id,
            'nom_agence': obj.agence.nom_agence
        }

    def get_images(self, obj):
        return [
            {
                'id': img.id,
                'url': img.image.url if img.image else None,
                'is_principale': img.is_principale
            }
            for img in obj.images.all()
        ]

# api en une seule requete upload img plat

class PlatImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatImage
        fields = ['image', 'is_principale']


class PlatUploadSerializer(serializers.ModelSerializer):
    images = PlatImageUploadSerializer(many=True, write_only=True)

    class Meta:
        model = Plat
        fields = ['nom', 'description', 'type_plat', 'agence', 'images']

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        request = self.context.get('request')
        plat = Plat.objects.create(
            user_created=request.user,
            user_updated=request.user,
            **validated_data
        )

        for img_data in images_data:
            PlatImage.objects.create(plat=plat, **img_data)

        return plat


class PlatCreateWithImagesSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.FileField(), write_only=True,
        required=False
    )

    class Meta:
        model = Plat
        fields = ['id', 'nom', 'description', 'type_plat', 'agence', 'images']

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        request = self.context.get('request')
        plat = Plat.objects.create(
            user_created=request.user,
            user_updated=request.user,
            **validated_data
        )    
        # ✅ Marquer la première image comme principale
        for i, image in enumerate(images_data):
            PlatImage.objects.create(
                plat=plat,
                image=image,
                is_principale=(i == 0)  # ✅ première = True, autres = False
            )

        return plat


class MenuPlatSerializer(serializers.ModelSerializer):
    plat_detail = serializers.SerializerMethodField()

    class Meta:
        model = MenuPlat
        fields = '__all__'

    def get_plat_detail(self, obj):
        return PlatSerializer(obj.plat).data

class MenuSerializer(serializers.ModelSerializer):
    plats = serializers.SerializerMethodField()

    class Meta:
        model = Menu
        fields = '__all__'

    def get_plats(self, obj):
        menu_plats = MenuPlat.objects.filter(menu=obj)
        return MenuPlatSerializer(menu_plats, many=True).data

class CommandeSerializer(serializers.ModelSerializer):
    plat_detail = serializers.SerializerMethodField()
    menu_detail = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = '__all__'

    def get_plat_detail(self, obj):
        return PlatSerializer(obj.plat).data

    def get_menu_detail(self, obj):
        return {
            'id': obj.menu.id,
            'date_menu': obj.menu.date_menu
        }

class RetraitSerializer(serializers.ModelSerializer):
    commande_detail = CommandeSerializer(source='commande', read_only=True)

    class Meta:
        model = Retrait
        fields = '__all__'


#Debut Gestion vehicule
class TypeVehiculeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeVehicule
        fields = '__all__'

class VehiculeSerializer(serializers.ModelSerializer):
    type_vehicule_detail = serializers.SerializerMethodField()
    agence_detail = serializers.SerializerMethodField()
    statut_detail = serializers.SerializerMethodField()

    class Meta:
        model = Vehicule
        fields = '__all__'

    def get_type_vehicule_detail(self, obj):
        return {
            'id': obj.type_vehicule.id,
            'libelle': obj.type_vehicule.libelle
        }
    
    def get_agence_detail(self, obj):
        return {
            'id': obj.agence.id,
            'nom_agence': obj.agence.nom_agence
        }

    def get_statut_detail(self, obj):
        return {
            'id': obj.statut.id,
            'libelle_statut': obj.statut.libelle_statut
        }
    

class EntretienVehiculeSerializer(serializers.ModelSerializer):
    vehicule_detail = serializers.SerializerMethodField()

    class Meta:
        model = EntretienVehicule
        fields = '__all__'

    def get_vehicule_detail(self, obj):
        return {
            'id': obj.vehicule.id,
            'immatriculation': obj.vehicule.immatriculation,
            'description': obj.vehicule.description,
            'date_circulation': obj.vehicule.date_circulation
        }
    

def get_entretien_par_agence_avec_groupement(annee, agence_id=None, immatriculation=None):
    from collections import defaultdict

    queryset = EntretienVehicule.objects.filter(
        date_entretien_vehicule__year=annee
    )

    if agence_id is not None:
        queryset = queryset.filter(vehicule__agence__id=agence_id)

    if immatriculation:
        queryset = queryset.filter(vehicule__immatriculation__iexact=immatriculation)

    resultats = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
    total_global_mois = defaultdict(float)

    for ev in queryset:
        try:
           mois = int(ev.periode.split("-")[1])
        except Exception:
           mois = ev.date_entretien_vehicule.month
        agence = ev.vehicule.agence.nom_agence
        immat = ev.vehicule.immatriculation

        montant = float(ev.debit)
        resultats[agence][immat][mois] += montant
        total_global_mois[mois] += montant

    data = []
    total_global = 0.0

    for agence, vehicules in resultats.items():
        vehicule_list = []
        total_mois_agence = defaultdict(float)

        for immat, mois_dict in vehicules.items():
            total = sum(mois_dict.values())
            mois_data = {m: round(mois_dict.get(m, 0), 2) for m in range(1, 13)}

            for m, v in mois_data.items():
                total_mois_agence[m] += v

            vehicule_list.append({
                "immatriculation": immat,
                "mois": mois_data,
                "total": round(total, 2)
            })

        total_agence = sum(total_mois_agence.values())
        total_global += total_agence

        data.append({
            "agence": agence,
            "vehicules": vehicule_list,
            "total_agence_mois": {m: round(total_mois_agence.get(m, 0), 2) for m in range(1, 13)},
            "total_agence_global": round(total_agence, 2)
        })

    return {
        "donnees": data,
        "total_global_mois": {m: round(total_global_mois.get(m, 0), 2) for m in range(1, 13)},
        "total_global": round(total_global, 2)
    }

# Ressources Humaines
class SimulationHistoriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationHistorique
        fields = '__all__'

class SimulationHistorique2Serializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationHistorique2
        fields = '__all__'

class SimulationSalaireSerializer(serializers.ModelSerializer):
    historique = serializers.SerializerMethodField()
    total_matricule = serializers.SerializerMethodField()

    class Meta:
        model = SimulationSalaire
        fields = [
            'id',
            'matricule',
            'categorie',
            'date_naissance',
            'salaire_base',
            'sursalaire',
            'salaire_brut_2025',
            'created_at',
            'historique',
            'total_matricule',
        ]

    def get_historique(self, obj):
        request = self.context.get('request')
        historique_qs = obj.historique.all()

        filters = Q()
        if request is not None:
            annee_debut = request.query_params.get('annee_debut')
            annee_fin = request.query_params.get('annee_fin')
            salaire_min = request.query_params.get('salaire_min')
            salaire_max = request.query_params.get('salaire_max')

            if annee_debut:
                filters &= Q(annee__gte=annee_debut)
            if annee_fin:
                filters &= Q(annee__lte=annee_fin)
            if salaire_min:
                filters &= Q(salaire__gte=salaire_min)
            if salaire_max:
                filters &= Q(salaire__lte=salaire_max)

        if filters:
            historique_qs = historique_qs.filter(filters)

        self._filtered_historique = historique_qs  # stockage temporaire
        return SimulationHistoriqueSerializer(historique_qs, many=True).data

    def get_total_matricule(self, obj):
        historique_qs = getattr(self, '_filtered_historique', obj.historique.all())
        return {
            "salaire": sum(float(h.salaire) for h in historique_qs),
            "augmentation": sum(float(h.augmentation) for h in historique_qs),
            "cotisation": sum(float(h.cotisation) for h in historique_qs),
        }

class SimulationSalaire2Serializer(serializers.ModelSerializer):
    historique2 = serializers.SerializerMethodField()
    total_matricule = serializers.SerializerMethodField()

    class Meta:
        model = SimulationSalaire
        fields = [
            'id',
            'matricule',
            'categorie',
            'date_naissance',
            'salaire_base',
            'sursalaire',
            'salaire_brut_2025',
            'created_at',
            'historique2',
            'total_matricule',
        ]

    def get_historique2(self, obj):
        request = self.context.get('request')
        historique_qs = obj.historique2.all()

        filters = Q()
        if request is not None:
            annee_debut = request.query_params.get('annee_debut')
            annee_fin = request.query_params.get('annee_fin')
            salaire_min = request.query_params.get('salaire_min')
            salaire_max = request.query_params.get('salaire_max')

            if annee_debut:
                filters &= Q(annee__gte=annee_debut)
            if annee_fin:
                filters &= Q(annee__lte=annee_fin)
            if salaire_min:
                filters &= Q(salaire__gte=salaire_min)
            if salaire_max:
                filters &= Q(salaire__lte=salaire_max)

        if filters:
            historique_qs = historique_qs.filter(filters)

        self._filtered_historique2 = historique_qs  # Pour le total_matricule
        return SimulationHistorique2Serializer(historique_qs, many=True).data

    def get_total_matricule(self, obj):
        historique_qs = getattr(self, '_filtered_historique2', obj.historique2.all())
        return {
            "salaire": sum(float(h.salaire) for h in historique_qs),
            "augmentation": sum(float(h.augmentation) for h in historique_qs),
            "cotisation": sum(float(h.cotisation) for h in historique_qs),
        }

# Ressources Humaines
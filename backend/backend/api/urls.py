from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BesoinCreateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'agences', AgenceViewSet)
router.register(r'etats', EtatViewSet)
router.register(r'statuts', StatutViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'typebesoins', TypeBesoinViewSet)
router.register(r'priorites', PrioriteViewSet)
router.register(r'user-services', UserServiceViewSet)
router.register(r'user-agences', UserAgenceViewSet)
router.register(r'besoins', BesoinViewSet)
router.register(r'besoin-services', BesoinServiceViewSet)
router.register(r'besoin-documents', BesoinDocumentViewSet)
router.register(r'groups', GroupViewSet)

# cantine
router.register(r'typeplats', TypePlatViewSet)
router.register(r'plats', PlatViewSet)
router.register(r'plat-images', PlatImageViewSet)
router.register(r'menus', MenuViewSet)
router.register(r'menu-plats', MenuPlatViewSet)
router.register(r'commandes', CommandeViewSet)
router.register(r'retraits', RetraitViewSet)

# Entretien vehicule
router.register(r'typevehicules', TypeVehiculeViewSet)
router.register(r'vehicules', VehiculeViewSet),
router.register(r'entretienvehicules', EntretienVehiculeViewSet)

# Simulation salaire
router.register(r'simulation', SimulationViewSet),
router.register(r'simulation2', Simulation2ViewSet, basename='simulation2')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     # 👇 API non authentifiées, sans pagination
    path('api/public/typebesoins/', PublicTypeBesoinListAPIView.as_view(), name='public-typebesoin-list'),
    path('api/public/priorites/', PublicPrioriteListAPIView.as_view(), name='public-priorite-list'),
    path('besoins/creer/', BesoinCreateView.as_view(), name='besoin-creer'),
    path('api/plats/upload/', PlatUploadAPIView.as_view(), name='plat-upload'),
    path('api/allnopagin/agences/', AllAgenceNopginListAPIView.as_view(), name='allnopagin-agence-list'),
    path('api/allnopagin/typeplats/', PublicTypePlatListAPIView.as_view(), name='allnopagin-typeplat-list'),
    path('api/allnopagin/typevehicules/', PublicTypeVehiculeListAPIView.as_view(), name='allnopagin-typevehicule-list'),
    path('api/allnopagin/vehicules/', PublicVehiculeListAPIView.as_view(), name='allnopagin-vehicule-list'),
    path('api/allnopagin/statuts/', PublicStatutListAPIView.as_view(), name='allnopagin-statut-list'),
    path('plats/creer/', PlatCreateView.as_view(), name='plat-creer'),
    path('api/apb128/generer/', GenererAPB128View.as_view(), name='generer-apb128'),
    path('api/import-entretien/', ImportEntretienExcelView.as_view(), name='import-entretien'),
    path('api/etat-entretien-groupes/', EtatEntretienGroupesView.as_view(), name='etat-entretien-groupes'),
    path('api/simulationsalaire/upload/', SimulationSalaireUploadView.as_view(), name='simulation-upload'),
    path('api/simulationsalaire/list/', SimulationSalaireListView.as_view(), name='simulation-list'),
    path('api/generer-historique2/', GenererSimulationHistorique2View.as_view(), name='generer-historique2')
]


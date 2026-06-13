import 'package:go_router/go_router.dart';
import '../screens/register_business_screen.dart';
import '../screens/create_branch_screen.dart';
import '../screens/branch_dashboard_screen.dart';
import '../screens/services_screen.dart';
import '../screens/add_edit_service_screen.dart';
import '../screens/receptionist_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/register',
  routes: [
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterBusinessScreen(),
    ),
    GoRoute(
      path: '/create-branch',
      builder: (context, state) => const CreateBranchScreen(),
    ),
    GoRoute(
      path: '/branch-dashboard',
      builder: (context, state) => const BranchDashboardScreen(),
    ),
    GoRoute(
      path: '/services',
      builder: (context, state) => const ServicesScreen(),
    ),
    GoRoute(
      path: '/services/add',
      builder: (context, state) => const AddEditServiceScreen(),
    ),
    GoRoute(
      path: '/services/edit/:id',
      builder: (context, state) =>
          AddEditServiceScreen(serviceId: state.pathParameters['id']),
    ),
    GoRoute(
      path: '/receptionist',
      builder: (context, state) => const ReceptionistScreen(),
    ),
  ],
);

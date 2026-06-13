import 'package:go_router/go_router.dart';
import '../screens/register_business_screen.dart';
import '../screens/create_branch_screen.dart';
import '../screens/branch_dashboard_screen.dart';

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
  ],
);

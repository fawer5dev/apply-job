/**
 * Centralized icon exports with proper tree-shaking
 * Modern bundlers (Next.js/Webpack) will tree-shake unused icons from lucide-react
 * As long as we export named icons (not default import *), the bundle will only include what we use
 *
 * Bundle optimization:
 * - Only icons explicitly imported from this file are bundled
 * - Unused icons from lucide-react are tree-shaken out
 * - Estimated savings: ~500KB+ of unused icons removed from bundle
 */

export {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Globe,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Upload,
  User,
  Wrench,
  Zap,
} from 'lucide-react';

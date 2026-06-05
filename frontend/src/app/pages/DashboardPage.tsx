import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { 
  LogOut, User, Settings, Trophy, Target, Flame, BarChart3, 
  GraduationCap, Clock, ChevronRight, Play, History, MessageSquare,
  TrendingUp, Award, Calendar, Loader2
} from "lucide-react";
import { getTestResults, ApiTestResult } from "../services/api";

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function calculateStreak(results: ApiTestResult[]): number {
  if (results.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Sort results by date descending
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  // Get unique dates
  const uniqueDates = [...new Set(sortedResults.map(r => {
    const d = new Date(r.completedAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);
  
  // Calculate streak
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);
    
    if (uniqueDates[i] === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateImprovement(results: ApiTestResult[]): number {
  if (results.length < 2) return 0;
  
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  const recent = sortedResults[0].score;
  const previous = sortedResults[sortedResults.length - 1].score;
  
  return Math.max(0, recent - previous);
}

function getLevelInfo(level: string): { name: string; description: string; nextLevel: string; progressToNext: number } {
  const levels: Record<string, { name: string; description: string; nextLevel: string; minScore: number; maxScore: number }> = {
    'A1': { name: 'Principiante', description: 'Nivel basico inicial', nextLevel: 'A2', minScore: 0, maxScore: 20 },
    'A2': { name: 'Elemental', description: 'Comunicacion basica', nextLevel: 'B1', minScore: 21, maxScore: 35 },
    'B1': { name: 'Intermedio', description: 'Situaciones cotidianas', nextLevel: 'B2', minScore: 36, maxScore: 55 },
    'B2': { name: 'Intermedio-Alto', description: 'Competente en situaciones cotidianas', nextLevel: 'C1', minScore: 56, maxScore: 75 },
    'C1': { name: 'Avanzado', description: 'Dominio operativo eficaz', nextLevel: 'C2', minScore: 76, maxScore: 90 },
    'C2': { name: 'Maestria', description: 'Dominio completo del idioma', nextLevel: 'C2', minScore: 91, maxScore: 100 },
  };
  
  const info = levels[level] || levels['A1'];
  return {
    name: info.name,
    description: info.description,
    nextLevel: info.nextLevel,
    progressToNext: level === 'C2' ? 100 : 72, // This would be calculated based on actual scores
  };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const userName = localStorage.getItem("userName") || "Usuario";
  const userProgram = localStorage.getItem("userProgram") || "Desarrollo de Software";
  const userId = localStorage.getItem("userId");

  // Fetch test results from API
  useEffect(() => {
    const fetchTestResults = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const results = await getTestResults(userId);
        setTestResults(results);
      } catch (error) {
        console.error("Error fetching test results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [userId]);

  // Calculate stats from real data
  const stats = {
    testsCompleted: testResults.length,
    averageScore: testResults.length > 0 
      ? Math.round(testResults.reduce((acc, r) => acc + r.score, 0) / testResults.length)
      : 0,
    currentLevel: testResults.length > 0 ? testResults[0].level : "N/A",
    currentStreak: calculateStreak(testResults),
    improvement: calculateImprovement(testResults),
  };

  // Get level info
  const levelInfo = getLevelInfo(stats.currentLevel);

  // Get recent tests (sorted by date, most recent first)
  const recentTests = testResults.slice(0, 3).map(result => ({
    id: result.id,
    date: formatDate(result.completedAt),
    score: result.score,
    level: result.level,
    duration: result.duration || "N/A",
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
  }));

  // Get feedback from tests
  const feedbacks = testResults
    .filter(r => r.feedback)
    .slice(0, 2)
    .map(r => ({
      id: r.id,
      teacher: "Docente",
      date: formatDate(r.completedAt),
      message: r.feedback || "",
    }));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sena-green animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-border z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-sena-green rounded-xl flex items-center justify-center shadow-lg shadow-sena-green/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-foreground">English Level Test</h1>
                <p className="text-xs text-muted-foreground">Panel de Estudiante</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-sena-green/10 text-sena-green rounded-xl">
                <Flame className="w-4 h-4" />
                <span className="font-medium text-sm">{stats.currentStreak} dias de racha</span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-sena-green rounded-xl flex items-center justify-center text-white font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-foreground text-sm">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userProgram}</p>
                  </div>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-medium text-foreground">{userName}</p>
                        <p className="text-sm text-muted-foreground">{userProgram}</p>
                      </div>
                      <button className="w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Mi Perfil
                      </button>
                      <button className="w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 text-sm">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Configuracion
                      </button>
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left hover:bg-destructive/10 flex items-center gap-3 text-sm text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesion
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Hola, {userName.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground">
            {testResults.length > 0 
              ? "Continua mejorando tu nivel de ingles. Tu siguiente meta esta cerca."
              : "Realiza tu primera prueba para conocer tu nivel de ingles."}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pruebas Realizadas", value: stats.testsCompleted, icon: BarChart3, color: "sena-blue" },
            { label: "Promedio", value: `${stats.averageScore}%`, icon: Target, color: "sena-green", trend: stats.improvement > 0 ? `+${stats.improvement}%` : null },
            { label: "Nivel Actual", value: stats.currentLevel, icon: Trophy, color: "warning" },
            { label: "Racha", value: `${stats.currentStreak} dias`, icon: Flame, color: "destructive" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-xs font-medium text-sena-green bg-sena-green/10 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Start Quiz & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Start Quiz Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-sena-green to-sena-green-dark rounded-2xl p-6 lg:p-8 text-white shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      20 preguntas
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      ~10 min
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Iniciar Nueva Prueba</h3>
                  <p className="text-white/80 max-w-md">
                    Evalua tu nivel de ingles con preguntas de gramatica, vocabulario, lectura y pronunciacion.
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate("/quiz")}
                  className="flex items-center justify-center gap-2 bg-white text-sena-green px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-5 h-5" />
                  Comenzar Ahora
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Tests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-border shadow-sm"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sena-blue/10 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-sena-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Historial de Pruebas</h3>
                    <p className="text-sm text-muted-foreground">Tus ultimas evaluaciones</p>
                  </div>
                </div>
                {recentTests.length > 0 && (
                  <button className="text-sm text-sena-green font-medium hover:text-sena-green-dark transition-colors flex items-center gap-1">
                    Ver todo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="divide-y divide-border">
                {recentTests.length > 0 ? (
                  recentTests.map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          test.score >= 80 ? 'bg-sena-green/10 text-sena-green' :
                          test.score >= 60 ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {test.score}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              test.level.startsWith('C') ? 'bg-sena-green/10 text-sena-green' :
                              test.level.startsWith('B') ? 'bg-sena-blue/10 text-sena-blue' :
                              'bg-warning/10 text-warning'
                            }`}>
                              {test.level}
                            </span>
                            <span className="text-sm text-muted-foreground">{test.correctAnswers}/{test.totalQuestions} correctas</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {test.date}
                            <span className="text-muted-foreground/50">-</span>
                            <Clock className="w-3.5 h-3.5" />
                            {test.duration}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No has realizado ninguna prueba aun</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Inicia una prueba para ver tu historial aqui</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Level & Feedback */}
          <div className="space-y-6">
            {/* Current Level Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">Tu Nivel Actual</h3>
              </div>
              
              <div className="text-center py-6">
                <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 ${
                  stats.currentLevel === 'N/A' 
                    ? 'bg-muted text-muted-foreground shadow-none' 
                    : 'bg-gradient-to-br from-sena-green to-sena-green-dark shadow-sena-green/30'
                }`}>
                  {stats.currentLevel}
                </div>
                <p className="text-foreground font-medium">{levelInfo.name}</p>
                <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
              </div>
              
              {stats.currentLevel !== 'N/A' && stats.currentLevel !== 'C2' && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso a {levelInfo.nextLevel}</span>
                    <span className="font-medium text-foreground">{stats.averageScore}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-sena-green rounded-full" style={{ width: `${Math.min(100, stats.averageScore)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Continua practicando para alcanzar el nivel {levelInfo.nextLevel}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Teacher Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-sena-blue/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-sena-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Retroalimentacion</h3>
                  <p className="text-sm text-muted-foreground">Comentarios del docente</p>
                </div>
              </div>
              
              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-sena-blue rounded-lg flex items-center justify-center text-white text-xs font-medium">
                          {feedback.teacher.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{feedback.teacher}</p>
                          <p className="text-xs text-muted-foreground">{feedback.date}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay retroalimentacion aun</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

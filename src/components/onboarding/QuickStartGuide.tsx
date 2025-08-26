import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, FolderPlus, BarChart3, Users, PieChart, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

interface QuickStartTask {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  route?: string;
  action: string;
}

interface QuickStartGuideProps {
  onDismiss?: () => void;
}

export const QuickStartGuide = ({ onDismiss }: QuickStartGuideProps) => {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const tasks: QuickStartTask[] = [
    {
      id: 'create-project',
      title: 'Create Your First Project',
      description: 'Start by creating a new project to begin financial modeling',
      icon: FolderPlus,
      completed: completedTasks.includes('create-project'),
      route: PATHS.projectsNew,
      action: 'Create Project'
    },
    {
      id: 'setup-model',
      title: 'Set Up Financial Model',
      description: 'Configure your project parameters and financial assumptions',
      icon: BarChart3,
      completed: completedTasks.includes('setup-model'),
      route: PATHS.model,
      action: 'Open Model'
    },
    {
      id: 'create-portfolio',
      title: 'Create a Portfolio',
      description: 'Group multiple projects into a portfolio for consolidated analysis',
      icon: PieChart,
      completed: completedTasks.includes('create-portfolio'),
      route: PATHS.portfolio,
      action: 'Create Portfolio'
    },
    {
      id: 'invite-team',
      title: 'Invite Team Members',
      description: 'Collaborate with your team by inviting members to your organization',
      icon: Users,
      completed: completedTasks.includes('invite-team'),
      action: 'Invite Team'
    }
  ];

  const completedCount = completedTasks.length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedCount / totalTasks) * 100;

  const handleTaskAction = (task: QuickStartTask) => {
    if (task.route) {
      navigate(task.route);
    }
    
    // Mark task as completed (in a real app, this would be based on actual completion)
    if (!completedTasks.includes(task.id)) {
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const handleMarkComplete = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setCompletedTasks(prev => [...prev, taskId]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Get up and running with Feasly in just a few steps
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completedCount} of {totalTasks} completed
          </Badge>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                task.completed 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                  : 'bg-muted/30 border-border hover:border-primary/50 cursor-pointer'
              }`}
              onClick={() => !task.completed && handleTaskAction(task)}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleMarkComplete(task.id, e)}
                  className="text-primary hover:text-primary/80"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <task.icon className={`h-5 w-5 ${task.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div>
                  <div className={`font-medium ${task.completed ? 'text-green-800 dark:text-green-200' : 'text-foreground'}`}>
                    {task.title}
                  </div>
                  <div className={`text-sm ${task.completed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {task.description}
                  </div>
                </div>
              </div>
              {!task.completed && (
                <Button variant="ghost" size="sm" className="text-primary">
                  {task.action}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {completedCount === totalTasks && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-medium text-green-800 dark:text-green-200">Congratulations!</div>
            <div className="text-sm text-green-600 dark:text-green-400">
              You've completed the quick start guide. You're ready to start using Feasly effectively!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
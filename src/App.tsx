import { useState } from "react";
import "./App.css";
import Instructor from "@instructor-ai/instructor";
import OpenAI from "openai";
import { z } from "zod";

// Zod schemas
const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const PriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: TaskStatusEnum,
  priority: PriorityEnum,
});

const ExtractedTaskSchema = z.object({
  title: z.string().describe("Make this a zany title"),
  description: z.string().describe("Make this a really really boring description"),
  priority: PriorityEnum,
});

const InstructorResponseSchema = z.object({
  tasks: z
    .array(ExtractedTaskSchema)
    .describe(
      "An array of tasks, if there's no task specified then return FIVE absurd tasks that nobody would ever do!!!"
    ).min(1),
});

// Types
type Task = z.infer<typeof TaskSchema>;
type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement authentication",
    description: "Add user login/signup functionality",
    status: "TODO",
    priority: "HIGH",
  },
  {
    id: "2",
    title: "Create dashboard",
    description: "Design and implement main dashboard view",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
  },
  {
    id: "3",
    title: "Write tests",
    description: "Add unit tests for core functionality",
    status: "DONE",
    priority: "LOW",
  },
];

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const instructor = Instructor({
  client: openai,
  mode: "TOOLS",
});

function App() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTask = (taskData: Omit<Task, "id">) => {
    const newTask = TaskSchema.parse({
      ...taskData,
      id: crypto.randomUUID(),
    });
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const extractTasksFromMessage = async (
    message: string
  ): Promise<ExtractedTask[]> => {
    try {
      console.log("Extracting tasks from message:", message);
      const response = await instructor.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Analyze this message: ${message}. If it requests or describes tasks that need to be created, format them as a JSON array with title, description and priority (HIGH/MEDIUM/LOW) fields. If no clear tasks are mentioned, return an empty array.`,
          },
        ],
        model: "gpt-4o-mini",
        response_model: {
          name: "ExtractedTasks",
          schema: InstructorResponseSchema,
        },
        max_retries: 3,
      });
      console.log(response);

      return response.tasks;
    } catch (error) {
      console.error("Failed to extract tasks:", error);
      return [];
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsLoading(true);
    setChatMessages([...chatMessages, `You: ${chatInput}`]);

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: chatInput }],
        model: "gpt-4o-mini",
      });

      const aiResponse =
        completion.choices[0]?.message?.content || "No response";
      setChatMessages((prev) => [...prev, `AI: ${aiResponse}`]);

      // Only extract and add tasks if the message seems to be requesting task creation

      const extractedTasks = await extractTasksFromMessage(chatInput);
      extractedTasks.forEach((task) => {
        addTask({
          status: "TODO",
          ...task,
        });
      });
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setChatMessages((prev) => [
        ...prev,
        "AI: Sorry, I encountered an error.",
      ]);
    } finally {
      setIsLoading(false);
      setChatInput("");
    }
  };

  return (
    <div className="flex h-screen max-h-screen w-screen">
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {task.title}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    task.priority === "HIGH"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="mt-3 text-gray-600">{task.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-600">
                  {task.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-[400px] flex-col border-l border-gray-200 bg-gray-50">
        <div className="border-b border-gray-200 bg-white p-4">
          <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-auto p-4">
          {chatMessages.map((message, index) => (
            <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
              {message}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleChatSubmit}
          className="border-t border-gray-200 bg-white p-4"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask AI to generate tasks..."
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
}

export default App;

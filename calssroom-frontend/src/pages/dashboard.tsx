import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BACKEND_BASE_URL } from "@/constants";
import { useCustom, useLink } from "@refinedev/core";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type LatestData = {
  latestClasses: {
    id: number;
    name: string;
    createdAt?: string;
    subject: {
      createdAt: Date;
      updatedAt: Date;
      id: number;
      departmentId: number;
      name: string;
      code: string;
      description: string | null;
    } | null;
    teacher?: {
      name: string;
    };
  }[]; // ✅ FIXED

  latestTeachers: {
    createdAt: Date;
    updatedAt: Date;
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: "student" | "teacher" | "admin";
    imageCldPubId: string | null;
  }[];
};

type OverviewCount = {
  users: number;
  teachers: number;
  admins: number;
  subjects: number;
  departments: number;
  classes: number;
};

type ChartsData = {
  usersByRole: { role: string; total: number }[];
  subjectsByDepartment: { departmentName: string; totalSubjects: number }[];
  classesBySubject: { subjectName: string; totalClasses: number }[];
};

const roleColors = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7"];

const Dashboard = () => {
  const Link = useLink();

  // Aggregates for charts
  const { query: chartsQuery } = useCustom<{ data: ChartsData }>({
    url: `${BACKEND_BASE_URL}stats/charts`,
    method: "get",
  });

  // Get the data safely
  const charts = chartsQuery.data?.data?.data;

  const usersByRole = useMemo(() => {
    return charts?.usersByRole ?? [];
  }, [charts]);

  const subjectsByDepartment = useMemo(() => {
    return charts?.subjectsByDepartment ?? [];
  }, [charts]);

  const classesBySubject = useMemo(() => {
    return charts?.classesBySubject ?? [];
  }, [charts]);

  // Overview counts for core entities
  const { query: overviewQuery } = useCustom<{ data: OverviewCount }>({
    url: `${BACKEND_BASE_URL}stats/overview`,
    method: "get",
    queryOptions: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  });

  const overviewCount = useMemo(() => {
    return overviewQuery.data?.data?.data;
  }, [overviewQuery.data]);

  // Latest activity summaries

  const { query: latestQuery } = useCustom<{ data: LatestData }>({
    url: `${BACKEND_BASE_URL}stats/latest`,
    method: "get",
  });

  const latest = latestQuery.data?.data?.data;

  const newestClasses = latest?.latestClasses ?? [];
  const newestTeachers = latest?.latestTeachers ?? [];

  const topDepartments = useMemo(() => {
    return [...subjectsByDepartment]
      .sort((a, b) => b.totalSubjects - a.totalSubjects)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        departmentId: index,
      }));
  }, [subjectsByDepartment]);

  const topSubjects = useMemo(() => {
    return [...classesBySubject]
      .sort((a, b) => b.totalClasses - a.totalClasses)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        subjectId: index,
      }));
  }, [classesBySubject]);

  const kpis = useMemo(
    () => [
      {
        label: "Total Users",
        value: overviewCount?.users ?? 0,
        icon: Users,
        accent: "text-blue-600",
      },
      {
        label: "Teachers",
        value: overviewCount?.teachers ?? 0,
        icon: GraduationCap,
        accent: "text-emerald-600",
      },
      {
        label: "Admins",
        value: overviewCount?.admins ?? 0,
        icon: ShieldCheck,
        accent: "text-amber-600",
      },
      {
        label: "Subjects",
        value: overviewCount?.subjects ?? 0,
        icon: BookOpen,
        accent: "text-purple-600",
      },
      {
        label: "Departments",
        value: overviewCount?.departments ?? 0,
        icon: Building2,
        accent: "text-cyan-600",
      },
      {
        label: "Classes",
        value: overviewCount?.classes ?? 0,
        icon: Layers,
        accent: "text-rose-600",
      },
    ],
    [overviewCount],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground">
          A quick snapshot of the latest activity and key metrics.
        </p>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {kpi.label}
                  </p>
                  <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="total"
                    nameKey="role"
                    data={usersByRole}
                    innerRadius={90}
                    outerRadius={160}
                    paddingAngle={3}
                    scale={5}
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell
                        key={`${entry.role}-${index}`}
                        fill={roleColors[index % roleColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 pt-20">
              {usersByRole.map((entry, index) => (
                <span
                  key={entry.role}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: roleColors[index % roleColors.length],
                    }}
                  />
                  {entry.role} · {entry.total}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>New Classes (last 5)</CardTitle>
            </CardHeader>
            <CardContent>
              {newestClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes yet</p>
              ) : (
                <div className="space-y-2">
                  {newestClasses.map((cls, index) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between rounded-md border border-transparent px-3 py-1 transition-colors hover:border-primary/30 hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-muted-foreground">
                          {cls.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>New Teachers (last 5)</CardTitle>
            </CardHeader>
            <CardContent>
              {newestClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes yet</p>
              ) : (
                <div className="space-y-2">
                  {newestTeachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between rounded-md border border-transparent px-3 py-1 transition-colors hover:border-primary/30 hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-muted-foreground">
                          {teacher.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Subjects per Department
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectsByDepartment}>
                  <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="totalSubjects"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Classes per Subject
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classesBySubject}>
                  <XAxis dataKey="subjectName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="totalClasses"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Newest Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newestClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent classes.
              </p>
            )}

            {newestClasses.map((item, index) => (
              <Link
                key={item.id}
                to={`/classes/show/${item.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subject?.name ?? "No subject"} ·{" "}
                      {item.teacher?.name ?? "No teacher"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Newest Teachers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newestTeachers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent teachers.
              </p>
            )}
            {newestTeachers.map((teacher, index) => (
              <Link
                key={teacher.id}
                to={`/users/show/${teacher.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.email}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Departments with Most Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDepartments.map((dept, index) => (
              <div
                key={dept.departmentId}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{dept.departmentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.totalSubjects} subjects
                    </p>
                  </div>
                </div>
                <Badge>{dept.totalSubjects}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Subjects with Most Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSubjects.map((subject, index) => (
              <div
                key={subject.subjectId}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{subject.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject.totalClasses} classes
                    </p>
                  </div>
                </div>
                <Badge>{subject.totalClasses}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Separator />
    </div>
  );
};

export default Dashboard;

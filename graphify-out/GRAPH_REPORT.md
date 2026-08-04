# Graph Report - .  (2026-08-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1074 nodes · 2242 edges · 96 communities (59 shown, 37 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `43c35751`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 48
- Community 51
- Community 53
- Community 54
- Community 55
- Community 56
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 94

## God Nodes (most connected - your core abstractions)
1. `cn()` - 330 edges
2. `Button()` - 33 edges
3. `apiClient` - 26 edges
4. `db` - 22 edges
5. `Badge()` - 17 edges
6. `Card()` - 16 edges
7. `CardContent()` - 16 edges
8. `Input()` - 16 edges
9. `react` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `AlertTitle()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils.ts
- `AlertDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils.ts
- `AlertAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils.ts
- `AttachmentContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/attachment.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (96 total, 37 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (48): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertDialogMedia(), AlertDialogOverlay(), AvatarBadge(), AvatarGroup() (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (48): TaskForm, categoryColor, categoryLabel, formatDate(), formatDateTime(), priorityColor, priorityLabel, statusColor (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (40): AttendanceRecord, Attendance, AttendanceHistoryPage(), AttendanceRecord, FilterType, formatDurationShort(), formatTime(), monthNames (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (36): buttonVariants, Calendar(), CalendarDayButton(), Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (39): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (31): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (27): getStatusBadge(), LeavePage(), LeaveRequest, leaveTypes, EmployeeProfilePage(), getInitials(), getPasswordStrength(), roleColors (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (31): AdminReportsPage(), CompanySettings, Employee, monthNames, statusDot, statusLabel, TimeFilter, columns (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (31): AdminAttendancePage(), Employee, formatDuration(), formatSalary(), formatTime(), getEmployeeStatus(), getInitials(), getLiveEarning() (+23 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (23): defaultForm, DeviceInfo, Employee, EmployeeForm, categoryColors, categoryLabels, defaultForm, EmployeeLite (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (16): categoryColors, categoryLabels, createFormDefault, EmployeeLite, CompanySettings, OfficeBranch, SettingsPageProps, timeOptions (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (16): HoverCardContent(), InputOTP(), InputOTPGroup(), InputOTPSlot(), NativeSelect(), NativeSelectOptGroup(), NativeSelectOption(), NativeSelectProps (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (24): AttendanceRecord, categoryColor, categoryLabel, formatDate(), formatDuration(), formatHours(), formatRupiah(), months (+16 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (23): Sidebar(), SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarGroupLabel(), SidebarInput(), SidebarInset(), SidebarMenuAction() (+15 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (3): client, db, companySetting

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (17): AdminSalariesPage(), defaultFormData, Employee, formatRupiah(), getStatusConfig(), MONTHS, SalaryFormData, SalaryRecord (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (5): AuthUser, getAuthUser(), requireAuth(), requireRole(), auth

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (11): adminPageTitles, DashboardLayout(), employeePageTitles, getPageTitle(), SessionUserExtended, employeeMenus, MobileNavProps, Badge() (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (15): Home(), HeaderProps, AppSidebar(), AppSidebarProps, getMenusByRole(), MenuItem, SidebarContent(), SidebarFooter() (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (13): Notification, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (16): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Field(), FieldContent(), FieldDescription(), FieldError() (+8 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (12): account, attendance, device, leave, notification, officeBranch, reward, rewardItem (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (7): Attendance, DetailType, Employee, ReportStats, Reward, Task, EmptyStateProps

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (12): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (11): Attachment(), AttachmentAction(), AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia(), attachmentMediaVariants (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.21
Nodes (7): UseApiState, api(), apiClient, ApiError, buildCacheKey(), buildUrl(), FetchOptions

### Community 31 - "Community 31"
Cohesion: 0.35
Nodes (5): getRedirectPath(), LoginPage(), Button(), Input(), Label()

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 34 - "Community 34"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.31
Nodes (3): POST(), calculateDistance(), checkBranchProximity()

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (9): @aws-sdk/client-s3, date-fns, @hugeicons/core-free-icons, dependencies, @aws-sdk/client-s3, date-fns, @hugeicons/core-free-icons, radix-ui (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (6): ALL_ALLOWED, ALLOWED_DOC_TYPES, ALLOWED_IMAGE_TYPES, POST(), getPresignedUploadUrl(), getR2Client()

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (6): figtree, geistMono, geistSans, metadata, RootLayout(), viewport

### Community 42 - "Community 42"
Cohesion: 0.38
Nodes (6): Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 44 - "Community 44"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 48 - "Community 48"
Cohesion: 0.50
Nodes (4): Marker(), MarkerContent(), MarkerIcon(), markerVariants

### Community 51 - "Community 51"
Cohesion: 0.67
Nodes (3): AdminDashboardPage(), formatCurrency(), Stats

### Community 53 - "Community 53"
Cohesion: 0.83
Nodes (3): createUser(), formatDate(), seed()

### Community 55 - "Community 55"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **278 isolated node(s):** `Employee`, `StatusKey`, `statusConfig`, `Stats`, `EmployeeForm` (+273 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 27`, `Community 28`, `Community 31`, `Community 32`, `Community 33`, `Community 34`, `Community 38`, `Community 40`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 48`?**
  _High betweenness centrality (0.440) - this node is a cross-community bridge._
- **Why does `AttendancePage()` connect `Community 2` to `Community 35`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 37` to `Community 3`, `Community 4`, `Community 7`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 67`, `Community 68`, `Community 69`, `Community 71`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `Employee`, `StatusKey`, `statusConfig` to the rest of the system?**
  _278 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05639097744360902 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05411764705882353 - nodes in this community are weakly interconnected._
import { apiKey } from "./schemas/api-keys.schema";
import { domain } from "./schemas/domain.schema";
import { site } from "./schemas/site.schema";
import { user } from "./schemas/user.schema";
import { workspaceUser } from "./schemas/workspace-user.schema";
import { workspace } from "./schemas/workspace.schema";

export default {
  user,
  site,
  domain,
  apiKey,
  workspace,
  workspaceUser,
} as const;

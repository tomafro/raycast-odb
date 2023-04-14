import { List, ActionPanel, Action, LaunchProps, Icon, Color, Detail } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { useMemo, useState } from "react";

interface SearchArguments {
  query: string;
}

function iconFor(type: string) {
  switch (type) {
    case "bookmark":
      return { source: Icon.Bookmark, tintColor: Color.Green };
    case "place":
      return { source: Icon.Map, tintColor: Color.Green };
    case "software":
      return { source: Icon.Terminal, tintColor: Color.Green };
    case "person":
      return { source: Icon.Person, tintColor: Color.Green };
    case "code":
      return { source: Icon.Code, tintColor: Color.Green };
    case "daily-note":
      return { source: Icon.Calendar, tintColor: Color.Green };
    default:
      return { source: Icon.Document };
  }
}

export default function Search(props: LaunchProps<{ arguments: SearchArguments }>) {
  const [searchText, setSearchText] = useState(props.arguments.query || "");
  const { isLoading, data, revalidate } = useExec("/Users/tom/.cargo/bin/odb", ["search", "--json", searchText]);
  const results = useMemo<{ title: string, type: string, path: string, url: string, content: string }[]>(() => JSON.parse(data || "[]"), [data]);

  const items = (results || []).map((item) => (
    <List.Item key={item.url} title={item.title} icon={iconFor(item.type)}
      actions={
        <ActionPanel title={item.title}>
          <Action.OpenInBrowser title="Open in Obsidian" url={item.url} />
        </ActionPanel>
      }
      detail={
        <List.Item.Detail markdown={`# ${item.title}\n` + item.content} />
      } />
  ))

  if (searchText != undefined && searchText.length > 0 && !results.find(item => item.title === searchText)) {
    items.unshift(<List.Item key="create" title={`Create "${searchText}"`} icon={Icon.Plus} actions={
      <ActionPanel title={"Create new note"}>
        <Action.OpenInBrowser title="Create in Obsidian" url={"obsidian://new?name=" + encodeURIComponent(searchText)} />
      </ActionPanel>
    } />)
  }

  return (
    <List
      filtering={false}
      isLoading={isLoading}
      isShowingDetail={true}
      navigationTitle="Search all documents"
      onSearchTextChange={(v) => {
        setSearchText(v)
      }}
      searchText={searchText}
    >
      {items}
    </List>
  );
};

import { AxiosRequestConfig } from "axios";
import { apiClient } from "../axios";
import { ResolveIssueRequest, ResolveIssueResponse } from "./types";

const ENDPOINT = "/issue";

export async function getIssues(page: string, options: AxiosRequestConfig) {
  const { data } = await apiClient.get(ENDPOINT, {
    params: { page },
    signal: options?.signal,
  });
  return data;
}

export async function resolveIssue(issueId: string, dto: ResolveIssueRequest) {
  const { data } = await apiClient.patch<
    ResolveIssueResponse,
    ResolveIssueRequest
  >(`${ENDPOINT}/${issueId}`, dto);
  return data;
}

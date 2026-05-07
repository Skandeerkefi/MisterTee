import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBase";

const api = axios.create({
	baseURL: getApiBaseUrl(),
});

export default api;

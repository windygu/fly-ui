<%@ Page Language="C#" AutoEventWireup="true" %>

<%		string sleep = this.Request["sleep"];
		if (!string.IsNullOrEmpty(sleep))
		{
			System.Threading.Thread.Sleep(int.Parse(sleep));
		}

		string error = this.Request["error"];
		if (!string.IsNullOrEmpty(error))
		{
			throw new Exception(error);
		}

		string data = this.Request["data"];
		if (!string.IsNullOrEmpty(data))
		{
			this.Response.Write(data);
		}
%>
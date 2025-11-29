using System;
using System.IO;
using System.Threading.Tasks;
using Renci.SshNet;
using WhatTheFuck.classes;

namespace xemuh2stats.classes
{
    public static class sftp_uploader
    {
        // SFTP configuration keys
        private const string CONFIG_NAME = "sftp";
        private const string KEY_ENABLED = "enabled";
        private const string KEY_HOST = "host";
        private const string KEY_PORT = "port";
        private const string KEY_USERNAME = "username";
        private const string KEY_PASSWORD = "password";
        private const string KEY_PUBLIC_PATH = "public_path";
        private const string KEY_PRIVATE_PATH = "private_path";

        private static configuration_collection _configs;

        public static void initialize(configuration_collection configs)
        {
            _configs = configs;

            // Create default config if it doesn't exist
            if (_configs[CONFIG_NAME] == null)
            {
                var config = _configs.add(CONFIG_NAME);
                config.set(KEY_ENABLED, "false");
                config.set(KEY_HOST, "104.207.143.249");
                config.set(KEY_PORT, "22");
                config.set(KEY_USERNAME, "");
                config.set(KEY_PASSWORD, "");
                config.set(KEY_PUBLIC_PATH, "/home/carnagereport/stats/public");
                config.set(KEY_PRIVATE_PATH, "/home/carnagereport/stats/private");
                config.save();
            }
        }

        public static bool is_enabled()
        {
            var config = _configs?[CONFIG_NAME];
            if (config == null) return false;
            return config.get(KEY_ENABLED, "false").ToLower() == "true";
        }

        public static void upload_stats(string statsFilePath, string identityFilePath)
        {
            if (!is_enabled())
            {
                Console.WriteLine("SFTP upload is disabled");
                return;
            }

            var config = _configs[CONFIG_NAME];
            if (config == null)
            {
                Console.WriteLine("SFTP configuration not found");
                return;
            }

            string host = config.get(KEY_HOST, "");
            int port = int.Parse(config.get(KEY_PORT, "22"));
            string username = config.get(KEY_USERNAME, "");
            string password = config.get(KEY_PASSWORD, "");
            string publicPath = config.get(KEY_PUBLIC_PATH, "/home/carnagereport/stats/public");
            string privatePath = config.get(KEY_PRIVATE_PATH, "/home/carnagereport/stats/private");

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username))
            {
                Console.WriteLine("SFTP host or username not configured");
                return;
            }

            // Run upload in background to not block UI
            Task.Run(() =>
            {
                try
                {
                    using (var client = new SftpClient(host, port, username, password))
                    {
                        client.Connect();
                        Console.WriteLine($"SFTP connected to {host}");

                        // Upload stats file to public directory
                        if (!string.IsNullOrEmpty(statsFilePath) && File.Exists(statsFilePath))
                        {
                            string remoteStatsPath = $"{publicPath}/{Path.GetFileName(statsFilePath)}";
                            using (var fileStream = File.OpenRead(statsFilePath))
                            {
                                client.UploadFile(fileStream, remoteStatsPath, true);
                                Console.WriteLine($"Uploaded stats to: {remoteStatsPath}");
                            }
                        }

                        // Upload identity file to private directory
                        if (!string.IsNullOrEmpty(identityFilePath) && File.Exists(identityFilePath))
                        {
                            string remoteIdentityPath = $"{privatePath}/{Path.GetFileName(identityFilePath)}";
                            using (var fileStream = File.OpenRead(identityFilePath))
                            {
                                client.UploadFile(fileStream, remoteIdentityPath, true);
                                Console.WriteLine($"Uploaded identity to: {remoteIdentityPath}");
                            }
                        }

                        client.Disconnect();
                        Console.WriteLine("SFTP upload complete");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SFTP upload error: {ex.Message}");
                }
            });
        }
    }
}

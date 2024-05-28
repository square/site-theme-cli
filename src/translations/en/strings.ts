const strings = {
	commands: {
		auth: {
			description: 'Authorizes Square Online CLI with Access Token. \n Visit https://developer.squareup.com/ for more information.',
			flags: {
				force: {
					description: 'Overwrite existing Access Token',
				},
			},
			args: {
				accessToken: {
					description: 'Square Connect Access Token',
				},
				skipPermissionsCheck: {
					description: 'Skip the permissions check for Access Token. By default this will check to see that the token has all the required permissions',
				},
			},
			body: {
				warnAlreadyHasAccessToken: 'Already have access token saved. Use --force to overwrite.',
				saving: 'Saving Access Token',
				saved: 'Saved.',
			},
		},
		theme: {
			preview: {
				description: 'Prints development preview links for Square Online custom theme sites.',
				flags: {
					siteId: {
						description: 'ID of Square Online site to you would like to preview, use to skip site selector step.',
					},
				},
				body: {
					siteNotFound: 'Unable to find Square Online site.',
					siteNoThemeInstalled: 'The Square Online site you have installed does not have a theme installed.',
					noSquareOnlineSitesFound: 'No Square Online sites found.',
					noSitesWithThemesInstalled: 'No Square Online sites found with a theme installed.',
					siteTitleList: 'Square Online Sites',
					useInstallCommand: 'Use the "theme install" command to install a theme to your Square Online site.',
					selectSite: 'Choose which Square Online site you would like to preview',
					previewChangesPrompt: 'You can preview your changes through the following URL(s):',
					noCustomThemesFound: 'No custom themes found for this site.',
				},
			},
			install: {
				description: 'Installs theme on a Square Online site.',
				flags: {
					siteId: {
						description: 'ID of Square Online site on which you would like to install a theme, use to skip site selector step.',
					},
				},
				args: {},
				body: {
					siteNotFound: 'Unable to find Square Online site.',
					siteThemeInstalled: 'The Square Online site you have selected already has a theme installed.',
					noSitesToInstall: 'No Square Online sites found.',
					allSitesHaveThemesInstalled: 'All Square Online sites have themes installed.',
					siteTitleList: 'Sites',
					usePullCommandToClone: 'Use "square-online-cli theme pull" command to download files locally',
					confirmInstallBriskOnSite: 'This will install the default Brisk theme to your Square Online site: {siteTitle}',
					startInstalling: 'Installing Theme ...',
					doneInstalling: 'Complete',
					confirmLocalPull: 'Would you like to pull the theme files locally?',
				},
			},
			pull: {
				description: 'Clone Square Online Theme Files Locally',
				flags: {
					siteId: {
						description: 'The Square Online site id that you would like to pull files from.',
					},
					accessToken: {
						description: 'Use this flag to pass in an access token. If not passed the CLI will look for an access token saved during "auth" command.',
					},
					yes: {
						description: 'Use this flag to skip the confirmation prompts',
					},
					themeDir: {
						description: 'Path to theme directory. If the directory does not exist it will be created.',
					},
				},
				args: {},
				body: {
					siteTitleList: 'Sites',
					useInstallCommand: 'Use "square-online-cli theme install" to install a theme on a Square Online site.',
					noSitesWithThemesInstalled: 'No Square Online sites with themes installed',
					noSquareOnlineSitesFound: 'No Square Online sites found.',
					siteNoThemeInstalled: 'The Square Online does not have a theme installed. See "square-online-cli theme install".',
					siteNotFound: 'Unable to find Square Online site.',
					selectSite: 'Select the Square Online site theme you would like to copy locally',
					promptThemeDir: 'Enter the folder you would like your theme files to be downloaded to',
					preparingDir: 'Preparing theme directory for download',
					downloadListTitle: 'Downloading Files',
					overwriteWarning: 'The files in the directory {destinationDir} will be overwritten. Do you wish to continue?',
					noCustomThemesFound: 'No custom themes found for this site.',
				},
			},
			push: {
				description: 'Push your local theme files to your Square Online site. Files with the following patterns will be ignored by default: {ignoreList}, as well as any patterns within the /.soignore file',
				flags: {
					themeDir: {
						description: 'Path to theme directory.',
					},
					siteId: {
						description: 'The Square Online site id that you would like to push files to.',
					},
					themeId: {
						description: 'The theme you would like to push files to.',
					},
					omitDelete: {
						description: 'If set the CLI will skip any delete operations during syncing',
					},
					accessToken: {
						description: 'Use this flag to pass in an access token. If not passed the CLI will look for an access token saved during "auth" command.',
					},
					yes: {
						description: 'Use this flag to skip the confirmation prompts',
					},
				},
				args: {},
				body: {
					siteTitleList: 'Sites',
					useInstallCommand: 'Use "square-online-cli theme install" to install a theme on a Square Online site.',
					noSitesWithThemesInstalled: 'No Square Online sites with themes installed',
					noSquareOnlineSitesFound: 'No Square Online sites found.',
					siteNoThemeInstalled: 'The Square Online does not have a theme installed. See "square-online-cli theme install".',
					siteNotFound: 'Unable to find Square Online site.',
					siteSelectorPrompt: 'Select the site you would like to push your code to.',
					themeDirPushPrompt: 'Enter the theme directory you would like to push',
					themeChanges: 'The following changes will be pushed to your Square Online store:',
					themeNotFound: 'The theme you are trying to push to does not exist.',
					noCustomThemesFound: 'No custom themes found for this site.',
					create: 'Create',
					update: 'Update',
					delete: 'Delete',
					confirmPushPrompt: 'Do you wish to continue?',
					pushFilesTitle: 'Pushing Theme Changes',
					creating: 'Creating',
					updating: 'Updating',
					deleting: 'Deleting',
					noChangesToPush: 'No changes to push. Exiting.',
					invalidThemeDir: 'The theme directory provided is not valid, please provide a valid theme directory',
				},
			},
			watch: {
				description: 'Watch your theme directory and automatically upload file changes to Square Online. Files with the following patterns will be ignored by default: {ignoreList} as well as any patterns within the /.soignore file',
				flags: {
					themeDir: {
						description: 'Path to theme directory for watching.',
					},
					siteId: {
						description: 'The id of the Square Online site you would like to sync to.',
					},
					themeId: {
						description: 'The theme you would like to sync files to.',
					},
					hotReload: {
						description: 'Set this flag to print the preview links and enable hot reloading',
					},
					omitDelete: {
						description: 'If set the CLI will skip any delete operations during syncing',
					},
				},
				args: {},
				body: {
					siteTitleList: 'Sites',
					useInstallCommand: 'Use "square-online-cli theme install" to install a theme on a Square Online site.',
					noSitesWithThemesInstalled: 'No Square Online sites with themes installed',
					noSquareOnlineSitesFound: 'No Square Online sites found.',
					siteNoThemeInstalled: 'This Square Online site does not have a theme installed. See "square-online-cli theme install".',
					siteNotFound: 'Unable to find Square Online site.',
					selectSitePrompt: 'Select the site you would like to sync your code to.',
					themeDirPrompt: 'Enter the theme directory you would like to sync',
					themeNotFound: 'The theme you are trying to sync to does not exist.',
					noCustomThemesFound: 'No custom themes found for this site.',
					confirmPushForOutOfSync: 'Your current theme directory is out of sync, would you like to push your changes?',
					pushTaskFileTitle: 'Pushing Theme Changes',
					creating: 'Creating',
					updating: 'Updating',
					deleting: 'Deleting',
					syncThemeFilesTitle: 'Syncing Theme Files',
					startingWatcher: 'Watching For Changes in Directory: {themeDir}',
					previewChangesPrompt: 'You can preview your changes at the following URL(s):',
					exiting: 'Press Any Key To Exit Watcher',
					invalidThemeDir: 'The theme directory provided is not valid, please provide a valid theme directory',
				},
			},
		},
	},
	utilities: {
		permissions: {
			noAccessToken: 'No Access Token Found. Please add an access token with square-online-cli auth',
			verifyingPermissions: 'Verifying Permissions',
			missing: 'Missing',
		},
		siteSelector: {
			noSites: 'No Square Online sites available.',
			exiting: 'Exiting',
		},
	},
	components: {
		prompt: {
			defaultSiteSelectorPrompt: 'Select a site',
		},
		log: {
			levels: {
				info: 'INFO',
				warn: 'WARN',
				error: 'ERROR',
			},
		},
		task: {
			actions: {
				creating: 'creating',
				updating: 'updating',
				deleting: 'deleting',
				downloading: 'downloading',
				completed: 'completed',
				downloadError: 'error downloading',
				error: 'error',
			},
		},
		custom: {
			printDeltaObjectSummary: {
				title: 'Theme Changes',
				create: 'Create',
				update: 'Update',
				delete: 'Delete',
			},
		},
	},
	global: {
		flags: {
			verbose: 'Print all API logs in console.',
		},
		errorLogMessage: 'Check error log for more information: {logPath}',
	},
};

export default strings;

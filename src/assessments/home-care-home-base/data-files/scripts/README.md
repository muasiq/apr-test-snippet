# Steps for creating new configs:

-   get the assessment form viewer report pdf and download that to the assets folder for the new org
-   run this docker command to convert it to html (pwd should be the assets folder with the file): `docker run -ti --rm -v .:/pdf  pdf2htmlex/pdf2htmlex:0.18.8.rc2-master-20200820-alpine-3.12.0-x86_64 --zoom 1.3 Assessment_Form_Viewer_Report_PDF.pdf`
-   copy an existing upload<name>Configuration.ts file to the new org
-   make a new super duper config google sheet and copy the id for it into the upload<name>Configuration.ts file
-   get the id of the google drive with all the files in it for the org and update that in the script as well
-   add this user: apricot-data-file-scripts@grand-water-415721.iam.gserviceaccount.com as an editor and content manager for the super duper config sheet and the google drive with all the files in it
-   copy the Master Question Map file in the drive for another org to this orgs drive folder. Update the answer file name in folder column to match the new org (may match already)
-   update the upload script to remove any file paths that reference the wrong assets, or the incorrect file names within the org's google drive folder
-   run the upload script: `npx vite-node src/assessment/home-care-home-base/orgs/<org>/upload<name>Configuration.ts`

## Debugging issues with physical assessment

-   missing header row: delete all header rows in the assessment form view report and then just ensure you have one header row (whatever column name you want) before the start of the actual data (usually row 14)
-   we rely on a css property that gives us the indent level, sometimes new pdfs have new indent levels. You'll have to add them to the right spot in the xMap
-   the logs after running the physical assessment file may print various issues you will need to manually look into

## Master Question Map/SOC Standard Assessment

## Pathways

use this prompt with claude and pass it as many images that you can at a time:

```
The images contains text at various indentation levels inside the Build/Link problems header. The images are a continuation of each-other. The indentation represents a parent/child relationship. Parse and respond with the text properly nested in an array of objects

Text: the text we are interested in will end with a code in parenthesis, for example (1122000), or will be a Yes/No child

return your response as an array of json, with each object containing a text property and any children based of the indentation level

[

{"text": "<text here>", "children": []}

<additional rows here>

]

example:

[
	{
		text: 'NEED FOR OTHER DISCIPLINES (8440)',
		children: [
			{
				text: 'NO',
			},
			{
				text: 'YES',
				children: [
					{
						text: 'PT EVALUATION (1105199)',
						children: [
							{
								text: 'NO',
							},
							{
								text: 'YES',
							},
						],
					},
					{
						text: 'ST EVALUATION (1105200)',
						children: [
							{
								text: 'NO',
							},
							{
								text: 'YES',
							},
						],
					},
				],
			},
		],
	},
];

```

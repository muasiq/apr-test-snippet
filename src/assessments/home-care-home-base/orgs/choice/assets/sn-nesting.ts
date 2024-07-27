const leafChildren = [{ text: 'NO' }, { text: 'YES' }];

export const choicePathwaysNesting = [
	{
		text: 'SN EVALUATION PERFORMED.  ADDITIONAL VISITS TO BE PROVIDED. (1104908)',
		children: [
			{
				text: 'NO',
			},
			{
				text: 'YES',
				children: [
					{
						text: 'COVID-19 INFECTION (1122111)',
						children: leafChildren,
					},
					{
						text: 'RISK OF INFECTION (1122137)',
						children: leafChildren,
					},
					{
						text: 'USE OF TELECOMMUNICATION DURING COVID-19 PANDEMIC (1122099)',
						children: leafChildren,
					},
					{
						text: 'MED/SURG NURSING (1105171)',
						children: [
							{
								text: 'NO',
								children: [
									{
										text: 'THERAPY ONLY PATIENT (1105173)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
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
																	{
																		text: 'OT EVALUATION (1105201)',
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
																		text: 'MSW EVALUATION (1105202)',
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
																		text: 'AIDE SERVICES (1105203)',
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
																		text: 'DIETICIAN EVALUATION (1104910)',
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
													{
														text: 'NEED FOR ADDITIONAL PHYSICIANS - SN (1103848)',
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
								],
							},
							{
								text: 'YES',
								children: [
									{
										text: 'ALTERED CARDIOVASCULAR SYSTEM (1105117)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR OBSERVATION/ASSESSMENT AND SKILLED TEACHING AND TRAINING RELATED TO CARDIOVASCULAR SYSTEM (1105118)',
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
														text: 'NEED FOR HYPERTENSION MANAGEMENT (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (1105120)',
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
														text: 'NEED FOR CONGESTIVE HEART FAILURE MANAGEMENT (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (000000)',
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
									{
										text: 'ALTERED RESPIRATORY SYSTEM (1105121)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR OBSERVATION/ASSESSMENT AND SKILLED TEACHING AND TRAINING RELATED TO RESPIRATORY SYSTEM (1105122)',
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
														text: 'NEED FOR SKILLED TEACHING RELATED TO OXYGEN THERAPY (111234)',
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
														text: 'NEED FOR SKILLED TEACHING RELATED TO TRACHEOSTOMY CARE (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (0000000)',
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
									{
										text: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR SN FOR OBSERVATION, ASSESSMENT, AND TEACHING RELATED TO GASTROINTESTINAL DISEASE (1105125)',
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
														text: 'NEED FOR SKILLED PROCEDURE RELATED TO GASTROINTESTINAL SYSTEM (1105174)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR COLOSTOMY/ILEOSTOMY TEACHING/CARE (1105126)',
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
																		text: 'NEED FOR GASTROSTOMY/JEJUNOSTOMY TEACHING (1105127)',
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
																		text: 'NEED FOR GASTROSTOMY/JEJUNOSTOMY FEEDING/CARE (1105128)',
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
																		text: 'NEED FOR IMPACTION REMOVAL (1105129)',
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
																		text: 'NEED FOR ENEMA (1105130)',
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
												],
											},
										],
									},
									{
										text: 'ALTERED GENITOURINARY SYSTEM (8245)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR SN FOR OBSERVATION, ASSESSMENT, AND TEACHING RELATED TO GENITOURINARY DISEASE (1105131)',
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
														text: 'NEED FOR SKILLED PROCEDURE RELATED TO GENITOURINARY SYSTEM (1105132)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR INDWELLING URINARY CATHETER (1105133)',
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
																		text: 'NEED FOR INSERTION MANAGEMENT OF INDWELLING URINARY CATHETER (1105134)',
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
																		text: 'NEED FOR INSERTION MANAGEMENT OF INTERMITTENT STRAIGHT CATHETER (1105136)',
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
																		text: 'NEED FOR TEACHING RELATED TO INTERMITTENT STRAIGHT CATHETERIZATION (1105135)',
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
																		text: 'NEED FOR SKILLED CARE RELATED TO BLADDER INSTILLATION/IRRIGATION (1105137)',
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
												],
											},
										],
									},
									{
										text: 'ALTERED SKIN INTEGRITY (8257)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR OBSERVATION/ASSESSMENT AND SKILLED TEACHING AND TRAINING RELATED TO PRESERVATION OF SKIN INTEGRITY (1105138)',
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
														text: 'NEED FOR WOUND CARE (1105139)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR PRESSURE ULCER CARE (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (1105140)',
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
																		text: 'NEED FOR INCISION SITE CARE (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (1105141)',
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
																		text: 'NEED FOR NEGATIVE PRESSURE WOUND THERAPY (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (000000)',
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
																		text: 'NEED FOR WOUND CARE NOT OTHERWISE SPECIFIED (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT)',
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
												],
											},
										],
									},
									{
										text: 'NEED FOR SKILLED CARE RELATED TO RISK FOR FALLS (1105144)',
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
										text: 'ALTERED NEUROLOGICAL STATUS (1105175)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR OBSERVATION/ASSESSMENT AND SKILLED TEACHING AND TRAINING RELATED TO NEUROLOGICAL SYSTEM (1105145)',
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
														text: 'NEED FOR CEREBRAL VASCULAR ACCIDENT MANAGEMENT (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT)',
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
									{
										text: "ALTERED MENTAL STATUS (GENERALIZED DEPRESSION AND ALZHEIMER'S DISEASE WITH BEHAVIORAL DISORDERS) (1104907)",
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR OBSERVATION, ASSESSMENT AND SKILLED TEACHING RELATED TO GENERALIZED DEPRESSION (1105147)',
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
														text: "NEED FOR OBSERVATION, ASSESSMENT AND SKILLED TEACHING RELATED TO MANAGEMENT OF PATIENT'S ALZHEIMER'S DISEASE WITH BEHAVIORAL DISTURBANCES (00000000)",
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
									{
										text: 'ALTERED ENDOCRINE SYSTEM (8279)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR SKILLED TEACHING RELATED TO DIABETES (8281)',
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
														text: 'NEED FOR SKILLED CARE - DIABETES MANAGEMENT (8282)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR INSULIN ADMINISTRATION (8283)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INSULIN INJECTION THERAPY (8289)',
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
																		text: "NEED FOR MONITORING OF PATIENT'S BLOOD GLUCOSE LOG (8284)",
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
																		text: 'NEED FOR BLOOD GLUCOSE TESTING (8287)',
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
																		text: 'NEED FOR HYPOGLYCEMIC INTERVENTION (8285)',
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
													{
														text: 'NEED FOR PREFILLING OF INSULIN SYRINGES (1100629)',
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
									{
										text: 'NEED FOR INTERVENTIONS RELATED TO PAIN MANAGEMENT (1105153)',
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
										text: 'NEED FOR DIAGNOSTIC TEST (8307)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR OTHER LAB (8309)',
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
														text: 'NEED FOR O2 SATS (102141)',
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
														text: 'NEED FOR VENIPUNCTURE (1105215)',
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
														text: 'NEED FOR DIAGNOSTIC URINE/SPUTUM TEST (1105216)',
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
														text: 'NEED FOR DIAGNOSTIC CULTURE (1105217)',
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
									{
										text: 'NEED FOR IV AND/OR PARENTERAL THERAPY (1105156)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR SKILLED TEACHING FOR IV THERAPY (1105157)',
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
														text: 'NEED FOR PARENTERAL NUTRITION (USED IN CONJUNCTION WITH O/A AND SKILLED TEACHING PROBLEM STATEMENT) (1105158)',
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
														text: 'NEED FOR PROCEDURE IV THERAPY (1105159)',
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
									{
										text: 'IMPAIRED NUTRITION (MALNUTRITION/OBESITY) (1105167)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'MALNUTRITION (1105168)',
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
														text: 'OBESITY (1105169)',
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
									{
										text: 'MEDICATION MANAGEMENT (1105155)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR MEDICATION MANAGEMENT - NOT DISEASE SPECIFIC (1105154)',
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
														text: 'NEED FOR INJECTION ADMINISTRATION (1105160)',
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
														text: 'NEED FOR ANTICOAGULATION MONITORING, MANAGEMENT AND EDUCATION (1105161)',
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
														text: 'NEED FOR INR MONITORING (1105163)',
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
									{
										text: 'NEED FOR MANAGEMENT AND EVALUATION OF THE NON-SKILLED PLAN OF CARE (1105170)',
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
										text: 'MEASURES TO SATISFY PLAN OF CARE SYNOPSIS (M2250) RELATED TO; DIABETIC FOOT CARE, DEPRESSION, PAIN, FALLS AND PRESSURE ULCER PREVENTION. (USE WHEN OTHER PROBLEM STATEMENTS CONCERNING THESE ISSUES ARE NOT ALREADY CHOSEN) (0000000)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'MEASURES TO SATISFY PLAN OF CARE SYNOPSIS (M2250) RELATED TO; DIABETIC FOOT CARE (1120610)',
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
														text: 'MEASURES TO SATISFY PLAN OF CARE SYNOPSIS (M2250) RELATED TO FALLS (1120611)',
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
														text: 'MEASURES TO SATISFY PLAN OF CARE SYNOPSIS (M2250) RELATED TO DEPRESSION (1120612)',
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
														text: 'MEASURES TO SATISFY PLAN OF CARE SYNOPSIS (M2250) RELATED TO PAIN (1120613)',
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
														text: 'MEASURES TO SATISFY PLAN OF CARE SYNOPSIS (M2250) RELATED TO PRESSURE ULCER PREVENTION (1120614)',
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
									{
										text: 'NEED FOR OTHER DISCIPLINES (1105178)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR MSW PALLIATIVE EVALUATION (1122019)',
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
														text: 'OT EVALUATION (1105201)',
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
													{
														text: 'AIDE SERVICES (1105203)',
														children: [],
													},
													{
														text: 'MSW EVALUATION (1105202)',
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
														text: 'DIETICIAN EVALUATION (1104910)',
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
														text: 'NEED FOR ADDITIONAL PHYSICIANS - SN (1103848)',
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
									{
										text: 'ORDER VERIFICATION (RN ADD-ON EVALS ONLY - MANDATORY) (1104733)',
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
					{
						text: 'PSYCHIATRIC NURSING (USE ONLY IF YOU ARE A QUALIFIED PSYCH NURSE - CAN BE USED ALONE OR IN CONJUNCTION WITH MED/SURG NURSING) (1105177',
						children: [
							{
								text: 'NO',
							},
							{
								text: 'YES',
								children: [
									{
										text: 'PSYCHIATRIC NURSING (USE ONLY IF YOU ARE A QUALIFIED PSYCH NURSE - CAN BE USED ALONE OR IN CONJUNCTION WITH MED/SURG NURSING) (1',
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
					{
						text: 'PEDIATRIC NURSING (101580)',
						children: [
							{
								text: 'NO',
							},
							{
								text: 'YES',
								children: [
									{
										text: 'NEED FOR PEDI SKILLED NURSING SERVICES (101581)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'NEED FOR MEDICATION MANAGEMENT (1100932)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PRESCRIBED PEDI MEDICATIONS (101736)',
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
													{
														text: 'ALTERED CARDIAC (101271)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI CARDIAC DISEASE (101583)',
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
													{
														text: 'ALTERED CIRCULATORY (100590)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI CIRCULATORY SYSTEM (101585)',
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
													{
														text: 'ALTERED COMFORT (7557)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI COMFORT MEASURES (101587)',
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
													{
														text: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI GASTROINTESTINAL DISEASE (101589)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO BOWEL ELIMINATIONS (101590)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR SKILLED TEACHING RELATED TO DIARRHEA - PEDI (101591)',
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
																						text: 'NEED FOR SKILLED TEACHING RELATED TO CONSTIPATION - PEDI (101592)',
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
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO NUTRITIONAL FEEDINGS, I.E., ENTERAL FEEDINGS (101593)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI NASOGASTRIC TUBE (101594)',
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
																						text: 'NEED FOR PEDI NASOGASTRIC TUBE INSERTION / REMOVAL (101595)',
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
																						text: 'NEED FOR SKILLED TEACHING RELATED TO CARE OF PEDI GASTROSTOMY TUBE (101596)',
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
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PROVISION OF PEDI PARENTERAL NUTRITION, I.E., TPN (101597)',
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
													{
														text: 'ALTERED NUTRITION / HYDRATION (101598)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR IMBALANCED NUTRITION: PEDI - LESS THAN BODY REQUIREMENTS (101599)',
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
																		text: 'RISK FOR PEDI FLUID VOLUME DEFICIT (101600)',
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
													{
														text: 'ALTERED GENITOURINARY SYSTEM (8245)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI GENITOURINARY DISEASE (101603)',
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
																		text: 'NEED FOR SKILLED CARE RELATED TO PEDI INDWELLING URINARY CATHETER (101604)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO CARE OF PEDI INDWELLING URINARY CATHETER (101975)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI INTERMITTENT STRAIGHT CATHETERIZATION (101605)',
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
													{
														text: 'ALTERED NEUROLOGIC STATUS (8277)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR ALTERED PEDI BODY TEMPERATURE (101607)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI NEUROLOGIC DEFICITS (101609)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI SEIZURE DISORDER (101610)',
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
													{
														text: 'ALTERED RESPIRATORY STATUS (8299)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'INEFFECTIVE AIRWAY CLEARANCE RELATED TO EXCESS MUCOUS, IMPROPER POSITIONING - PEDI (101612)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI RESPIRATORY DISEASE (101613)',
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
																		text: 'NEED FOR PEDI TRACH CARE (101710)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI TRACH CARE (101711)',
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
																		text: 'NEED FOR PROVISION OF PEDI CHEST PHYSIOTHERAPY (101712)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PROVISION OF PEDI INHALATION THERAPY (101713)',
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
													{
														text: 'ALTERED IMMUNITY / POTENTIAL FOR INFECTION (100699)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR INFECTION RELATED TO DEFICIENT PEDI IMMUNOLOGIC DEFENSES & ENVIRONMENTAL FACTORS (101714)',
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
																		text: 'NEED FOR Q/A RELATED TO PEDI INFECTION CONTROL (101715)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI INFECTION CONTROL MEASURES (101717)',
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
													{
														text: 'ALTERED HOME SAFETY (8322)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR TRAUMA RELATED PEDI PHYSICAL HELPLESSNESS (101716)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI HOME SAFETY (101719)',
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
													{
														text: 'ALTERED ENDOCRINE SYSTEM / HEMAPOIETIC SYSTEM (101276)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR INJURY RELATED TO PEDI HYPERBILIRUBINEMIA (101720)',
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
																		text: 'NEED FOR SKILLED CARE - PEDI DIABETES MANAGEMENT (101976)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR PEDI INSULIN ADMINISTRATION (101722)',
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
																						text: 'NEED FOR PREFILLING OF INSULIN SYRINGES (1100629)',
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
																						text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI INSULIN INJECTION THERAPY (101723)',
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
																						text: 'NEED FOR PEDI BLOOD GLUCOSE MONITORING (101724)',
																						children: [],
																					},
																					{
																						text: 'NEED FOR PEDI HYPOGLYCEMIC INTERVENTION (101725)',
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
																],
															},
														],
													},
													{
														text: 'NEED FOR INJECTION THERAPY MANAGEMENT- NOT INCLUDING INSULIN (8288)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR PEDI INJECTION ADMINISTRATION (101726)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI INJECTION THERAPY (101727)',
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
													{
														text: 'ALTERED SKIN INTEGRITY (8257)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PRESERVATION OF PEDI SKIN INTEGRITY (101729)',
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
																		text: 'NEED FOR PEDI PRESSURE ULCER CARE (101730)',
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
																		text: 'NEED FOR CARE TO PEDI CLOSED INCISION / SUTURE LINE (101731)',
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
																		text: 'NEED FOR PEDI WOUND CARE NOT OTHERWISE SPECIFIED (101732)',
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
													{
														text: 'ACTIVITY INTOLERANCE / IMMOBILITY (8269)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI ACTIVITY / MOBILITY STATUS (101734)',
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
													{
														text: 'KNOWLEDGE DEFICITS NOT OTHERWISE SPECIFIED (8327)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI DEFICITS NOS (101737)',
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
													{
														text: 'NEED FOR INFUSION THERAPY (8312)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PEDI IV THERAPY (101740)',
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
																		text: 'NEED FOR PEDI IV ACCESS (101977)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR PEDI PERIPHERAL IV PLACEMENT/ACCESS (101741)',
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
																						text: 'NEED FOR PEDI SUBCLAVIAN / PICC / MEDIPORT ACCESS (101742)',
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
																						text: 'NEED FOR PEDI IV ADMINISTRATION (101743)',
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
																						text: 'NEED FOR PEDI IV SITE CARE (101744)',
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
																						text: 'NEED FOR PEDI IV FLUSH (101745)',
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
																],
															},
														],
													},
													{
														text: 'NEED FOR DIAGNOSTIC TEST (8307)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR PEDI VENIPUNCTURE (101746)',
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
																		text: 'NEED FOR PEDI LABS (101747)',
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
																		text: 'NEED FOR PEDI PT-INR (101972)',
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
																		text: 'NEED FOR PEDI O2 SATS (101971)',
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
																		text: 'NEED FOR PEDI PT SERVICES (101748)',
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
																		text: 'NEED FOR PEDI ST SERVICES (101749)',
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
																		text: 'NEED FOR PEDI OT SERVICES (101750)',
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
																		text: 'NEED FOR PEDI MSW SERVICES (101751)',
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
																		text: 'NEED FOR PEDI HOME HEALTH AIDE SERVICES (101752)',
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
													{
														text: 'NEED FOR ADDITIONAL PEDI PHYSICIANS (101753)',
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
								],
							},
						],
					},
					{
						text: 'MATERNAL NURSING (CAN BE USED ALONE OR OR IN CONJUNCTION WITH MED/SURG NURSING) (101191)',
						children: [
							{
								text: 'NO',
							},
							{
								text: 'YES',
								children: [
									{
										text: 'NEED FOR OBSTETRICS SKILLED NURSING SERVICES (101266)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'ALTERATION IN NUTRITIONAL STATUS (101282)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR FLUID VOLUME DEFICIT AND ELECTROLYTE IMBALANCES RELATED TO HYPEREMESIS GRAVIDARUM (101268)',
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
																		text: 'RISK FOR IMBALANCED NUTRITION: LESS THAN BODY REQUIREMENTS RELATED TO NAUSEA AND VOMITING (101269)',
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
													{
														text: 'RISK FOR LOSS OF PREGNANCY INTEGRITY (101270)',
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
														text: 'ALTERED CARDIAC SYSTEM (8206)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR ALTERATION IN CARDIAC OUTPUT RELATED TO GESTATIONAL HYPERTENSION OR PRE-ECLAMPSIA (101272)',
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
													{
														text: 'PRE-TERM LABOR (101275)',
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
														text: 'ALTERED PSYCHOSOCIAL (101278)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'INEFFECTIVE COPING RELATED TO POTENTIAL LOSS OF PREGNANCY (101279)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PSYCHOSOCIAL ISSUES (8295)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR SKILLED TEACHING RELATED TO BARRIERS OF CARE (8296)',
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
																						text: 'NEED FOR SKILLED TEACHING RELATED TO COMMUNITY RESOURCES (8297)',
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
																	{
																		text: 'NEED FOR PSYCHIATRIC NURSING EVALUATION (8578)',
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
													{
														text: 'STRESS RELATED TO POTENTIAL THREAT OF PREMATURE BIRTH (101280)',
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
														text: 'ALTERED COMFORT (7557)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PAIN CONTROL/COMFORT MEASURES (7565)',
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
													{
														text: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED INTERVENTION RELATED TO BOWEL (8222)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR SKILLED TEACHING RELATED TO DIARRHEA (8235)',
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
																						text: 'NEED FOR SKILLED TEACHING RELATED TO CONSTIPATION (8230)',
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
																						text: 'NEED FOR ENEMA (8238)',
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
																						text: 'NEED FOR IMPACTION REMOVAL (8237)',
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
																],
															},
														],
													},
													{
														text: 'ALTERED GENITOURINARY SYSTEM (8245)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO GENITOURINARY DISEASE (8247)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO URINARY INCONTINENCE (100695)',
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
																		text: 'NEED FOR SKILLED CARE RELATED TO INDWELLING CATHETER FOR FEMALE (1100542)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO CARE OF INDWELLING CATHETER (8248)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INTERMITTENT STRAIGHT CATHETERIZATION (100697)',
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
													{
														text: 'ALTERED IMMUNITY / POTENTIAL FOR INFECTION (100699)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INFECTION CONTROL (8325)',
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
													{
														text: 'ALTERED HOME SAFETY (8322)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO HOME SAFETY (102002)',
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
													{
														text: 'NEED FOR MEDICATION MANAGEMENT (1100932)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PRESCRIBED MEDICATIONS (8329)',
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
																		text: 'NEED TO PREFILL PLANNER DEVICE (1100339)',
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
													{
														text: 'NEED FOR INFUSION THERAPY (8312)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INFUSION THERAPY (8314)',
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
																		text: 'NEED FOR INFUSION ACCESS (1100978)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR PERIPHERAL INFUSION ACCESS (8317)',
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
																						text: 'NEED FOR MEDIPORT ACCESS (8318)',
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
																	{
																		text: 'NEED FOR INFUSION ADMINISTRATION (8315)',
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
																		text: 'NEED FOR INFUSION DEVICE SITE CARE (8319)',
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
																		text: 'NEED FOR IV FLUSH (8320)',
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
																		text: 'NEED FOR PICC LINE REMOVAL (1100976)',
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
																		text: 'NEED FOR LAB DRAW VIA VASCULAR ACCESS DEVICE (1100977)',
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
													{
														text: 'NEED FOR INJECTION THERAPY MANAGEMENT- NOT INCLUDING INSULIN (8288)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR B12 ADMINISTRATION (8290)',
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
																		text: 'NEED FOR LOVENOX INJECTION (102120)',
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
																		text: 'NEED FOR CALCIMAR ADMINISTRATION (8291)',
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
																		text: 'NEED FOR OTHER INJECTION NOT OTHERWISE SPECIFIED (8292)',
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
													{
														text: 'NEED FOR DIAGNOSTIC TEST (8307)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR VENIPUNCTURE (8308)',
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
																		text: 'NEED FOR OTHER LAB (8309)',
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
																		text: 'NEED FOR O2 SATS (102141)',
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
													{
														text: 'KNOWLEDGE DEFICITS NOT OTHERWISE SPECIFIED (8327)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING OF DISEASE(S) NOT OTHERWISE SPECIFIED (8330)',
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
																		text: 'NEED FOR PT SERVICES (8109)',
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
																		text: 'NEED FOR ST SERVICES (8363)',
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
																		text: 'NEED FOR OT SERVICES (7863)',
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
																		text: 'NEED FOR MSW SERVICES (7864)',
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
																		text: 'NEED FOR HOME HEALTH AIDE SERVICES (7861)',
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
																		text: 'NEED FOR RD SERVICES (117662)',
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
													{
														text: 'NEED FOR ADDITIONAL PHYSICIANS (100701)',
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
									{
										text: 'NEED FOR POSTPARTUM SKILLED NURSING (101281)',
										children: [
											{
												text: 'NO',
											},
											{
												text: 'YES',
												children: [
													{
														text: 'ALTERATION IN NUTRITIONAL STATUS (POSTPARTUM) (101284)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR IMBALANCED NUTRITION: LESS THAN BODY REQUIREMENTS RELATED TO ANOREXIA (101283)',
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
													{
														text: 'ALTERED PSYCHOSOCIAL ( POSTPARTUM) (101285)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR POSTPARTUM DEPRESSION (101286)',
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
																		text: 'RISK FOR DELAYED MOTHER / CHILD BONDING (101287)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PSYCHOSOCIAL ISSUES (8295)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR SKILLED TEACHING RELATED TO BARRIERS OF CARE (8296)',
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
																	{
																		text: 'NEED FOR PSYCHIATRIC NURSING EVALUATION (8578)',
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
													{
														text: 'ALTERED COMFORT (POSTPARTUM) (101288)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'PAIN RELATED TO BREAST ENGORGEMENT (101289)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PAIN CONTROL/COMFORT MEASURES (7565)',
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
													{
														text: 'ALTERED GASTROINTESTINAL SYSTEM (8212)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED INTERVENTION RELATED TO BOWEL (8222)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR SKILLED TEACHING RELATED TO DIARRHEA (8235)',
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
																						text: 'NEED FOR SKILLED TEACHING RELATED TO CONSTIPATION (8230)',
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
																						text: 'NEED FOR ENEMA (8238)',
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
																						text: 'NEED FOR IMPACTION REMOVAL (8237)',
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
																],
															},
														],
													},
													{
														text: 'ALTERED GENITOURINARY SYSTEM (8245)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO GENITOURINARY DISEASE (8247)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO URINARY INCONTINENCE (100695)',
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
																		text: 'NEED FOR BLADDER TRAINING (8251)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO CARE OF INDWELLING CATHETER (8248)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INTERMITTENT STRAIGHT CATHETERIZATION. (100697)',
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
													{
														text: 'ALTERED SKIN INTEGRITY (8257)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'CLOSED INCISION/SUTURE LINE (8261)',
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
																		text: 'NEED FOR WOUND CARE NOT OTHERWISE SPECIFIED (8262)',
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
													{
														text: 'ALTERED IMMUNITY / POTENTIAL FOR INFECTION (POSTPARTUM) (101290)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'RISK FOR INFECTION RELATED TO THE LABOR PROCESS (101291)',
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
																		text: 'RISK FOR INFECTION AND/OR WOUND DEHISCENCE RELATED TO C-SECTION (101292)',
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
																		text: 'RISK FOR INFECTION / HEMORRHAGE RELATED TO POSTPARTUM LOCHIA (101293)',
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
																		text: 'NEED FOR Q/A RELATED TO INFECTION CONTROL (8324)',
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
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INFECTION CONTROL (8325)',
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
													{
														text: 'ALTERED HOME SAFETY (8322)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO HOME SAFETY (102002)',
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
													{
														text: 'NEED FOR MEDICATION MANAGEMENT (1100332)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO PRESCRIBED MEDICATIONS (8329)',
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
																		text: 'NEED TO PREFILL PLANNED DEVICE (1100339)',
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
													{
														text: 'NEED FOR INJECTION THERAPY MANAGEMENT- NOT INCLUDING INSULIN (8288)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR B12 ADMINISTRATION (8290)',
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
																		text: 'NEED FOR LOVENOX INJECTION (102120)',
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
																		text: 'NEED FOR CALCIMAR ADMINISTRATION (8291)',
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
																		text: 'NEED FOR OTHER INJECTION NOT OTHERWISE SPECIFIED (8292)',
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
													{
														text: 'NEED FOR INFUSION THERAPY (3312)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR SKILLED TEACHING RELATED TO INFUSION THERAPY (8314)',
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
																		text: 'NEED FOR INFUSION ACCESS (1100978)',
																		children: [
																			{
																				text: 'NO',
																			},
																			{
																				text: 'YES',
																				children: [
																					{
																						text: 'NEED FOR PERIPHERAL INFUSION ACCESS (8317)',
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
																						text: 'NEED FOR MEDIPORT ACCESS (8318)',
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
																	{
																		text: 'NEED FOR INFUSION ADMINISTRATION (8315)',
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
																		text: 'NEED FOR INFUSION DEVICE SITE CARE (8319)',
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
																		text: 'NEED FOR IV FLUSH (8320)',
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
																		text: 'NEED FOR PICC LINE REMOVAL (1100976)',
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
																		text: 'NEED FOR LAB DRAW VIA VASCULAR ACCESS DEVICE (1100977)',
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
													{
														text: 'NEED FOR DIAGNOSTIC TEST (8307)',
														children: [
															{
																text: 'NO',
															},
															{
																text: 'YES',
																children: [
																	{
																		text: 'NEED FOR VENIPUNCTURE (8308)',
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
																		text: 'NEED FOR OTHER LAB (8309)',
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
																		text: 'NEED FOR O2 SATS (102141)',
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
																		text: 'NEED FOR PT SERVICES (8109)',
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
																		text: 'NEED FOR ST SERVICES (8363)',
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
																		text: 'NEED FOR OT SERVICES (7863)',
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
																		text: 'NEED FOR MSW SERVICES (7864)',
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
																		text: 'NEED FOR HOME HEALTH AIDE SERVICES (7861)',
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
																		text: 'NEED FOR RD SERVICES (117662)',
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
													{
														text: 'NEED FOR ADDITIONAL PHYSICIANS (100/01)',
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
								],
							},
						],
					},
					{
						text: 'NEED FOR 60 DAY PROGRESS SUMMARY (1105678)',
						children: leafChildren,
					},
				],
			},
		],
	},
];

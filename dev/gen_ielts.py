import json,random,re,glob,importlib.util,os,html
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.environ.get('OUT',os.path.join(HERE,'..','public','ielts','lessons.json'))

AUDIO={1:['Track 1.%d.mp3'%i for i in range(1,7)],2:['Track 2.%d.mp3'%i for i in range(1,9)],3:['Track 3.%d.mp3'%i for i in (1,2)],
 4:['Track 4.%d.mp3'%i for i in range(1,8)],5:['Track 5.%d.mp3'%i for i in range(1,4)],6:['Track 6.%d.mp3'%i for i in (1,2,4,5)],7:['Track 7.%d.mp3'%i for i in range(1,5)],8:[]}
VIDEO={1:2,2:2,3:2,4:2,5:7,6:1,7:1,8:3}

def blank(sent,word):
    m=re.search(re.escape(word),sent,re.I)
    return sent[:m.start()]+'___'+sent[m.end():] if m else None

def shuf(rng,xs):
    xs=list(xs); rng.shuffle(xs); return xs

def build(U):
    n=U['n']; rng=random.Random(1000+n); V=U['vocab']; lid='ie-u%02d'%n
    vocab=[{'en':w,'pos':p,'vi':vi,'ex':ex} for (w,p,vi,d,ex) in V]
    exs=[]
    def add(title,instr,items,**kw):
        e={'id':'%s-%d'%(lid.replace('ie-u','ie-u'),len(exs)+1),'title':'%d · %s'%(len(exs)+1,title),'instruction':instr,'items':items}
        e.update(kw); exs.append(e)
    # 1 match
    a=V[:7]; rights=shuf(rng,[d for (_,_,_,d,_) in a])
    left=[w for (w,_,_,_,_) in a]
    add('Vocabulary: Match','Nối từ với nghĩa tiếng Anh đúng. Match each word with its definition.',[{'t':'match','left':left,'right':rights,'a':[rights.index(d) for (_,_,_,d,_) in a]}])
    # 2 fill with box
    items=[{'t':'fill','q':blank(ex,w),'a':[[w]]} for (w,_,_,_,ex) in a]
    add('Vocabulary: Complete the sentences','Hoàn thành câu bằng các từ trong khung. Complete the sentences with the words in the box.',items,box=shuf(rng,left))
    # 3 mcq
    b=V[7:]; items=[]
    for (w,pos,_,_,ex) in b:
        pool=[x[0] for x in V if x[0]!=w and x[1]==pos]
        rest=[x[0] for x in V if x[0]!=w and x[0] not in pool]
        rng.shuffle(rest); pool=pool+rest
        ds=rng.sample(pool[:max(2,min(len(pool),4))],2) if len(pool)>=2 else pool; opts=shuf(rng,[w]+ds)
        items.append({'t':'mcq','q':blank(ex,w),'opts':opts,'a':opts.index(w)})
    add('Vocabulary: Choose the word','Chọn từ đúng để hoàn thành câu. Choose the correct word.',items)
    # 4 grammar mcq
    items=[{'t':'mcq','q':q,'opts':o,'a':a_} for (q,o,a_) in U['gm']]
    add('Grammar: Choose the answer','Chọn đáp án đúng. Choose the correct answer.',items)
    # 5 grammar fill
    items=[{'t':'fill','q':q,'a':[x if isinstance(x,list) else [x] for x in [ans]][0:1] if False else [ans if isinstance(ans,list) else [ans]]} for (q,ans) in U['gf']]
    add('Grammar: Complete the sentences','Viết dạng đúng của từ trong ngoặc. Write the correct form.',items)
    # 6 reading
    R=U['reading']
    passage='<h3>%s</h3>'%html.escape(R['title'])+''.join('<p>%s</p>'%html.escape(p) for p in R['paras'])
    items=[{'t':'note','html':'<p><b>Questions 1–%d:</b> Do the statements agree with the passage? Choose <b>True</b>, <b>False</b> or <b>Not given</b>.</p>'%len(R['tf'])}]
    items+=[{'t':'tf','q':s,'a':a_,'ng':True} for (s,a_) in R['tf']]
    items.append({'t':'note','html':'<p><b>Choose the correct answer.</b></p>'})
    items+=[{'t':'mcq','q':q,'opts':o,'a':a_} for (q,o,a_) in R['mc']]
    items.append({'t':'note','html':'<p><b>Answer the questions.</b> Use no more than THREE words.</p>'})
    items+=[{'t':'text','q':q,'a':ans if isinstance(ans,list) else [ans],'hint':'Viết câu trả lời ngắn…'} for (q,ans) in R['fl']]
    add('Reading','Đọc bài và trả lời câu hỏi. Read the passage and answer the questions.',items,passage=passage,band='R')
    # 7 listening
    Li=U['listening']
    items=[{'t':'dlg','lines':[list(x) for x in Li['lines']],'hide':True}]
    items+=[{'t':'mcq','q':q,'opts':o,'a':a_} for (q,o,a_) in Li['mc']]
    items+=[{'t':'fill','q':q,'a':[ans if isinstance(ans,list) else [ans]]} for (q,ans) in Li['fl']]
    add('Listening','Bấm Nghe cả hội thoại (nghe được nhiều lần) rồi trả lời. Listen to the conversation and answer.',items,band='L')
    # 8 media
    media=[{'t':'audio','title':t.replace('.mp3',''),'src':'ielts/AUDIO/UNIT %d/%s'%(n,t)} for t in AUDIO[n]]
    media+=[{'t':'video','title':'Unit %d · Video %d'%(n,k),'src':'ielts/VIDEO/UNIT %d/Unit %d_Video %d.mp4'%(n,n,k)} for k in range(1,VIDEO[n]+1)]
    add('Audio và Video của lớp','Nghe audio và xem video theo hướng dẫn của giáo viên. Bài này không chấm điểm.',[{'t':'note','html':'<p>Các file nghe và video bên dưới do giáo viên cung cấp cho Unit này. Hãy nghe, xem và ghi chú ý chính vào vở.</p>'}],media=media)
    # 9 writing
    W=U['writing']
    add('Writing (AI chấm)','Viết bài, nộp để AI chấm theo 4 tiêu chí IELTS. Write your answer and submit it for AI feedback.',[{'t':'wr','task':W['task'],'minWords':W['min'],'prompt':W['prompt'],'hint':W.get('hint','')}])
    # 10-11 speaking
    S=U['speaking']
    add('Speaking Part 1 (AI nhận xét)','Thu âm câu trả lời cho từng câu hỏi (khoảng 20–30 giây mỗi câu).',[{'t':'sp','part':'Part 1','prompt':q,'secs':60} for q in S['p1']])
    add('Speaking Part 2 (AI nhận xét)','Chuẩn bị 1 phút, rồi nói 1–2 phút. Prepare for one minute, then speak for one to two minutes.',[{'t':'sp','part':'Part 2','prompt':S['p2'],'card':S['card'],'secs':120}])
    return {'id':lid,'unit':900+n,'unitTitle':'Unit %d · %s'%(n,U['en']),'title':'Unit %d'%n,'sub':U['vi']+' · '+U['en'],'kind':'lesson','vocab':vocab,
            'grammar':[{'title':U['gtitle'],'html':U['gnote']}],'exercises':exs,'note':U['en']}

def main():
    out=[]
    for f in sorted(glob.glob(os.path.join(HERE,'ielts_units','u*.py'))):
        spec=importlib.util.spec_from_file_location('m',f); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        for U in m.UNITS: out.append(build(U))
    out.sort(key=lambda L:L['unit'])
    os.makedirs(os.path.dirname(OUT),exist_ok=True)
    json.dump(out,open(OUT,'w'),ensure_ascii=False,indent=0)
    print(len(out),'units',sum(len(L['exercises']) for L in out),'exercises')
main()

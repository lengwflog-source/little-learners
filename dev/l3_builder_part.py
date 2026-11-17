# ------------------------------------------------------------------ helpers
def plain(w): return re.sub(r'[^a-z]','',w)
def variants(w):
    vs=[w]
    if '-' in w: vs+= [w.replace('-',''),w.replace('-',' ')]
    return vs
def oem(v): return f'<span class="oem">{v[1]}'+(f'<small>{v[2]}</small>' if not re.fullmatch(r'\d+',v[1]) else '')+'</span>'
def toks(s):
    t=s.split(); out=[]
    for w in t:
        m=re.match(r"^(.*?)([.?!]+)$",w)
        if m and m.group(1): out+= [m.group(1),m.group(2)]
        else: out.append(w)
    return out
def blank(s,w):
    m=re.search(r'\b'+re.escape(w)+r'\b',s,re.I) or re.search(r'\b'+re.escape(w),s,re.I) or re.search(re.escape(w),s,re.I)
    assert m,(s,w)
    return s[:m.start()]+'___'+s[m.end():]

def build_lesson(idx,title,sub,group,gtitle,V,S1,S2,QA,GR,seedkey,pool,lid):
    R=random.Random(zlib.crc32(seedkey.encode()))
    byw={v[0]:v for v in V}
    P=[v for v in pool if v[0] not in byw]          # extra words (earlier units) used as distractors / top-up
    def shuf(l):
        l=list(l); R.shuffle(l); return l
    CONF=[{'hello','hi'},{'goodbye','bye'},{'mother','grandmother'},{'father','grandfather'},{'doctor','nurse'},{'cat','kitten'},{'pen','pencil'},{'football','basketball','volleyball'},{'bed','bedroom'},{'ball','football'},{'house','bedroom'}]
    def conf(a,b): return any(a in g and b in g for g in CONF)
    def distract(t,k,same_first=True):
        c=[v for v in V if v[0]!=t[0] and v[1]!=t[1] and not conf(t[0],v[0])]
        R.shuffle(c)
        c2=[v for v in P if v[1]!=t[1] and v[0]!=t[0] and not conf(t[0],v[0])]; R.shuffle(c2)
        return (c+c2)[:k]
    def sample(l,k): l=list(l); R.shuffle(l); return l[:k]
    def topup(words,k):
        w=list(words)
        for v in shuf(P):
            if len(w)>=k:break
            if v not in w: w.append(v)
        return w
    sent_words=[w for w in S1 if w in byw]          # words that have a pattern sentence
    EX=[]
    def add(n,name,instr,items,box=None):
        e={'id':f'{lid}-{n}','title':f'{n} · {name}','instruction':instr,'items':items}
        if box: e['box']=box
        EX.append(e)
    # 1 Listen and repeat
    items=[]
    for v in (V if len(V)<=8 else sample(V,8)): items.append({'t':'say','w':v[0],'em':v[1],'vi':v[2] if not re.fullmatch(r'\d+',v[1]) else ''})
    ss=[S1[w] for w in sent_words][:3] if len(V)<=8 else [S1[w] for w in sample(sent_words,3)]
    for s in ss: items.append({'t':'say','w':s,'em':'💬','vi':''})
    add(1,'Listen and repeat','Nghe và nói theo. Bấm nút ♪ để nghe, rồi đọc to lên nhé!',items)
    # 2 Listen and choose
    items=[]
    for t in (V if len(V)<=6 else sample(V,6)):
        ds=distract(t,2); opts=shuf([t]+ds)
        items.append({'t':'mcq','q':'Nghe và chọn hình đúng.','say':t[0],'opts':[oem(o) for o in opts],'a':opts.index(t)})
    add(2,'Listen and choose','Nghe rồi chọn hình đúng. Bấm ♪ để nghe lại.',items)
    # 3 Look and match
    ws=V if len(V)<=5 else sample(V,8 if len(V)>=8 else len(V)-(len(V)%2) if len(V)>5 else len(V))
    ch=[ws] if len(ws)<=5 else [ws[:len(ws)//2],ws[len(ws)//2:]]
    items=[]
    for grp in ch:
        order=shuf(range(len(grp)))
        if len(grp)>1 and order==list(range(len(grp))): order=order[1:]+order[:1]
        items.append({'t':'match','left':[v[0] for v in grp],'right':[oem(grp[o]) for o in order],'a':[order.index(k) for k in range(len(grp))]})
    add(3,'Look and match','Nhìn hình và nối từ với hình đúng.',items)
    # 4 Reorder the words
    cand=[]
    for w in sent_words: cand.append((S1[w],byw[w][1]))
    for w,s in S2.items():
        if w in byw: cand.append((s,byw[w][1]))
    for q,a,bw,em in QA:
        for s in (q,a):
            if len(toks(s))>=3: cand.append((s,'' if s==q else em))
    seen=set(); c2=[]
    for s,em in cand:
        if s not in seen: seen.add(s); c2.append((s,em))
    c2=sample(c2,5)
    items=[]
    for s,em in c2:
        t=toks(s); order=shuf(range(len(t)))
        tries=0
        while [t[o] for o in order]==t and tries<10: order=shuf(range(len(t))); tries+=1
        items.append({'t':'build','q':'Sắp xếp các từ thành câu đúng.','em':em if em and em!='💬' else '','tokens':[t[o] for o in order],'join':' ','a':[s]})
    add(4,'Reorder the words','Sắp xếp các từ thành câu đúng. Bấm vào từ để ghép, bấm lại để bỏ ra.',items)
    # 5 Reorder the letters
    pw=[v for v in V if re.fullmatch(r'[A-Za-z]{3,9}',v[0])]
    pw=topup(pw,5) if len(pw)<5 else pw
    pw=[v for v in pw if re.fullmatch(r'[A-Za-z]{3,9}',v[0])]
    items=[]
    for v in sample(pw,6):
        l=list(v[0]); order=shuf(range(len(l))); tries=0
        while ''.join(l[o] for o in order)==v[0] and tries<10: order=shuf(range(len(l))); tries+=1
        items.append({'t':'build','q':'Sắp xếp các chữ cái thành từ đúng.','em':v[1],'tokens':[l[o] for o in order],'join':'','a':[v[0]]})
    add(5,'Reorder the letters','Nhìn hình và sắp xếp các chữ cái thành từ đúng.',items)
    # 6 Wordsearch
    cw=[v for v in V if 3<=len(plain(v[0]))<=10]
    cw=topup(cw,4) if len(cw)<4 else cw
    cw=sample(cw,5 if len(V)<=8 else 6)
    words=[plain(v[0]) for v in cw]
    words=[w for w in words if not any(w!=x and w in x for x in words)]
    emo={plain(v[0]):v[1] for v in cw}
    size=max(8,max(len(w) for w in words)+1); size=min(size,11)
    for attempt in range(200):
        grid=[[None]*size for _ in range(size)]; pos={}; ok=True
        for w in sorted(words,key=len,reverse=True):
            placed=False
            for _ in range(200):
                dr,dc=R.choice([(0,1),(1,0),(1,1)])
                r=R.randrange(size-(len(w)-1)*dr); c=R.randrange(size-(len(w)-1)*dc)
                cells=[(r+dr*n,c+dc*n) for n in range(len(w))]
                if all(grid[a][b] in (None,w[n]) for n,(a,b) in enumerate(cells)):
                    for n,(a,b) in enumerate(cells): grid[a][b]=w[n]
                    pos[w]=[r,c,dr,dc]; placed=True; break
            if not placed: ok=False;break
        if ok:break
    assert ok
    for r in range(size):
        for c in range(size):
            if grid[r][c] is None: grid[r][c]=R.choice('abcdefghilmnoprstuy')
    items=[{'t':'ws','grid':[''.join(row).upper() for row in grid],'words':words,'pos':pos,'emo':emo}]
    add(6,'Wordsearch','Tìm các từ ẩn trong bảng chữ cái. Từ nằm ngang hoặc dọc hoặc chéo. Bấm chữ đầu rồi bấm chữ cuối của từ.',items)
    # 7 Choose the correct answer
    A=[];B=[]
    for v in V:
        ds=distract(v,2)
        if '-' in v[0] and False: pass
        opts=shuf([v]+ds)
        A.append({'t':'mcq','q':'Đây là gì?','em':v[1],'opts':[o[0] for o in opts],'a':opts.index(v)})
    for w in sent_words:
        v=byw[w]; ds=distract(v,2); opts=shuf([v]+ds)
        B.append({'t':'mcq','q':blank(S1[w],w).replace('___','_____'),'em':v[1],'opts':[o[0] for o in opts],'a':opts.index(v)})
    A=shuf(A);B=shuf(B)
    items=[x for p in itertools.zip_longest(A,B) for x in p if x][:6] if len(V)<=8 else (A[:3]+B[:3])
    items=[x for x in items if x][:6]
    add(7,'Choose the correct answer','Chọn đáp án đúng.',items)
    # 8 Read and tick/cross
    items=[]
    sw=sample(sent_words,6) if len(sent_words)>6 else shuf(sent_words)
    flags=([True,False]*4)[:len(sw)]; R.shuffle(flags)
    if len(set(flags))==1 and len(flags)>1: flags[0]=not flags[0]
    for w,f in zip(sw,flags):
        v=byw[w]
        if f: em=v[1]
        else: em=distract(v,1)[0][1]
        items.append({'t':'tf','tick':True,'q':S1[w],'em':em,'a':'T' if f else 'F'})
    add(8,'Read and tick or cross','Đọc câu và nhìn hình. Câu đúng chọn ✔, câu sai chọn ✘.',items)
    # 9 Look and write
    ww=V if len(V)<=6 else sample(V,6)
    items=[]; boxw=[]
    for k,v in enumerate(ww):
        if k<len(ww)-2 or len(ww)<=3 or v[0] not in S1 or v[0] in ('party',):
            items.append({'t':'fill','q':'___','em':v[1],'a':[variants(v[0])],'hint':f'bắt đầu bằng chữ {v[0][0]}'})
        else:
            items.append({'t':'fill','q':blank(S1[v[0]],v[0]),'em':v[1],'a':[variants(v[0])]})
        boxw.append(v[0])
    add(9,'Look and write','Nhìn hình và viết từ hoặc hoàn thành câu.',items,box=shuf(boxw))
    # 10 Read and fill in the blank
    items=[]; boxw=[]
    pairs=[]
    for w in sent_words: pairs.append(('s',w,S1[w],byw[w][1]))
    for w,s in S2.items():
        if w in byw: pairs.append(('s',w,s,byw[w][1]))
    for q,a,bw,em in QA: pairs.append(('q',bw,(q,a),em))
    R.shuffle(pairs); pairs=pairs[:5]
    for kind,w,s,em in pairs:
        if kind=='s': items.append({'t':'fill','q':blank(s,w),'em':em,'a':[variants(w)]}); boxw.append(w)
        else: items.append({'t':'fill','q':s[0]+' '+blank(s[1],w),'em':em,'a':[variants(w)]}); boxw.append(w)
    add(10,'Read and fill in the blank','Đọc câu và điền từ còn thiếu vào chỗ trống.',items,box=shuf(list(dict.fromkeys(boxw))))
    # 11 Listen and number
    def lm(grp,sent=False):
        order=shuf(range(len(grp)))
        if len(grp)>1 and order==list(range(len(grp))): order=order[1:]+order[:1]
        left=[f'<button class="say" data-say="{(S1[v[0]] if sent else v[0]).replace(chr(34),"")}" aria-label="Nghe" title="Nghe">♪</button> Nghe câu {k+1}' for k,v in enumerate(grp)]
        return {'t':'match','left':left,'right':[oem(grp[o]) for o in order],'a':[order.index(k) for k in range(len(grp))]}
    g1=V if len(V)<=4 else sample(V,4)
    items=[lm(g1)]
    sw2=[byw[w] for w in sent_words if byw[w] not in g1]
    sw2=(sw2 if len(sw2)>=3 else [byw[w] for w in sent_words])
    if len(sw2)>=3: items.append(lm(sample(sw2,4),True))
    add(11,'Listen and number','Nghe và chọn hình đúng cho mỗi câu (A, B, C…). Bấm ♪ để nghe.',items)
    # 12 Speaking cards
    items=[]
    for v in (V if len(V)<=8 else sample(V,8)):
        s=S1.get(v[0]) or S2.get(v[0]) or ''
        items.append({'t':'card','em':v[1],'w':v[0],'vi':v[2] if not re.fullmatch(r'\d+',v[1]) else '','s':s})
    for q,a,bw,em in QA[:2]: items.append({'t':'card','em':'💬','w':q,'s':a,'vi':'Hỏi và đáp'})
    add(12,'Speaking cards','Nhìn hình và nói to từ hoặc câu. Bấm vào thẻ để lật và nghe mẫu.',items)
    # 13 Grammar
    items=[{'t':'note','html':''.join((f'<h3>{x["title"]}</h3>' if x['title'] else '')+x['html'] for x in GR)}]
    gp=[]
    gs=sample([(w,S1[w]) for w in sent_words],2)
    for w,s in gs: gp.append({'t':'fill','q':blank(s,w),'em':byw[w][1],'a':[variants(w)]})
    q,a,bw,em=QA[0]
    gp.append({'t':'fill','q':q+' '+blank(a,bw),'em':em,'a':[variants(bw)]})
    items+=gp
    add(13,'Grammar','Đọc phần ghi nhớ mẫu câu, rồi làm 3 câu luyện tập.',items)
    # 14 Listen and label
    items=[]; boxw=[]
    for v in (V if len(V)<=6 else sample(V,6)):
        items.append({'t':'fill','q':'___','say':v[0],'em':v[1],'a':[variants(v[0])]}); boxw.append(v[0])
    add(14,'Listen and label','Nghe và viết tên cho mỗi hình. Bấm ♪ để nghe.',items,box=shuf(boxw))
    # 16 Unit test
    T=[]
    vs=shuf(V)
    cyc=itertools.cycle(vs)
    for _ in range(3):
        v=next(cyc); ds=distract(v,2); opts=shuf([v]+ds)
        T.append({'t':'mcq','q':'Đây là gì?','em':v[1],'opts':[o[0] for o in opts],'a':opts.index(v)})
    for _ in range(2):
        v=next(cyc); ds=distract(v,2); opts=shuf([v]+ds)
        T.append({'t':'mcq','q':'Nghe và chọn hình đúng.','say':v[0],'opts':[oem(o) for o in opts],'a':opts.index(v)})
    sw=shuf(sent_words)
    for k in range(3):
        w=sw[k%len(sw)]; v=byw[w]; f=(k%2==0) if k!=1 else False
        em=v[1] if f else distract(v,1)[0][1]
        T.append({'t':'tf','tick':True,'q':S1[w],'em':em,'a':'T' if f else 'F'})
    for k in range(2):
        w=sw[(k+3)%len(sw)]; v=byw[w]
        T.append({'t':'fill','q':blank(S1[w],w),'em':v[1],'a':[variants(w)]})
    sb=[(S1[w],byw[w][1]) for w in sent_words]
    for s,em in sample(sb,2):
        t=toks(s); order=shuf(range(len(t))); tries=0
        while [t[o] for o in order]==t and tries<10: order=shuf(range(len(t))); tries+=1
        T.append({'t':'build','q':'Sắp xếp thành câu đúng.','em':em,'tokens':[t[o] for o in order],'join':' ','a':[s]})
    add(16,'Unit test','Bài kiểm tra cuối Unit: 12 câu. Làm cẩn thận rồi bấm Nộp bài nhé!',T)
    return {'id':lid,'grade':8,'unit':group,'unitTitle':gtitle,'title':title,'sub':sub,'kind':'lesson','results':True,
            'vocab':[{'en':v[0],'vi':v[2] if not re.fullmatch(r'\d+',v[1]) else '','em':v[1],'ipa':'','pos':''} for v in V],
            'grammar':GR,'exercises':EX}

